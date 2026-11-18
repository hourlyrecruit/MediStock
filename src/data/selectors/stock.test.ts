import { FIXED_TODAY, makeBatch, makeMedicine, makeState } from '@/data/testing/fixtures';
import type { StockTransaction } from '@/data/types';
import {
  canDeleteMedicine,
  selectBatchHistory,
  selectBatchViews,
  selectBatchesForMedicine,
  selectExpired,
  selectExpiresToday,
  selectExpiringSoon,
  selectLowStock,
  selectMedicineById,
  selectMedicineViewById,
  selectMedicineViews,
  selectStockByMedicine,
} from './stock';

const TODAY = FIXED_TODAY;

function scenario(alertDays = 30) {
  return makeState({
    alertDays,
    medicines: [
      makeMedicine({ id: 'm1', name: 'Alpha', minStockLevel: 50 }),
      makeMedicine({ id: 'm2', name: 'Beta', minStockLevel: 30 }),
      makeMedicine({ id: 'm3', name: 'Gamma', minStockLevel: 100, isActive: false }),
      makeMedicine({ id: 'm4', name: 'Delta', minStockLevel: 5 }),
      makeMedicine({ id: 'm5', name: 'Epsilon', minStockLevel: 0 }),
    ],
    batches: [
      makeBatch({ id: 'b1', medicineId: 'm1', daysLeft: -1, quantity: 40 }),
      makeBatch({ id: 'b2', medicineId: 'm1', daysLeft: 0, quantity: 15 }),
      makeBatch({ id: 'b3', medicineId: 'm1', daysLeft: 20, quantity: 20 }),
      makeBatch({ id: 'b4', medicineId: 'm1', daysLeft: 45, quantity: 10 }),
      makeBatch({ id: 'b5', medicineId: 'm2', daysLeft: -10, quantity: 25 }),
      makeBatch({ id: 'b6', medicineId: 'm3', daysLeft: 200, quantity: 10 }),
      makeBatch({ id: 'b7', medicineId: 'm4', daysLeft: 5, quantity: 0 }),
      makeBatch({ id: 'b8', medicineId: 'm4', daysLeft: 300, quantity: 8 }),
      makeBatch({ id: 'b9', medicineId: 'missing', daysLeft: 300, quantity: 8 }),
    ],
  });
}

describe('stock selectors', () => {
  it('builds batch views joined with medicine and status, sorted by expiry', () => {
    const views = selectBatchViews(scenario(), TODAY);
    expect(views.map((v) => v.id)).toEqual(['b5', 'b1', 'b2', 'b7', 'b3', 'b4', 'b6', 'b8']);
    const today = views.find((v) => v.id === 'b2');
    expect(today?.status).toBe('EXPIRES_TODAY');
    expect(today?.isUsable).toBe(true);
    expect(today?.medicine.name).toBe('Alpha');
  });

  it('sums usable stock excluding expired and including expires-today', () => {
    const stock = selectStockByMedicine(scenario(), TODAY);
    expect(stock.m1).toEqual({
      usable: 45,
      expiringToday: 15,
      expiringSoon: 20,
      expired: 40,
      total: 85,
      batchCount: 4,
      nextExpiry: '2026-10-31',
    });
    expect(stock.m2?.usable).toBe(0);
    expect(stock.m2?.nextExpiry).toBeNull();
    expect(stock.m4?.nextExpiry).toBe('2027-08-27');
    expect(stock.m5).toEqual({
      usable: 0,
      expiringToday: 0,
      expiringSoon: 0,
      expired: 0,
      total: 0,
      batchCount: 0,
      nextExpiry: null,
    });
  });

  it('flags low stock only for active medicines', () => {
    const views = selectMedicineViews(scenario(), TODAY);
    expect(views.map((v) => v.name)).toEqual(['Alpha', 'Beta', 'Delta', 'Epsilon', 'Gamma']);
    const byId = Object.fromEntries(views.map((v) => [v.id, v]));
    expect(byId.m1?.isLowStock).toBe(true);
    expect(byId.m1?.shortfall).toBe(5);
    expect(byId.m2?.isLowStock).toBe(true);
    expect(byId.m2?.shortfall).toBe(30);
    expect(byId.m3?.isLowStock).toBe(false);
    expect(byId.m3?.shortfall).toBe(0);
    expect(byId.m4?.isLowStock).toBe(false);
    expect(byId.m5?.isLowStock).toBe(false);
  });

  it('sorts low stock by shortfall descending', () => {
    expect(selectLowStock(scenario(), TODAY).map((v) => v.id)).toEqual(['m2', 'm1']);
  });

  it('recomputes when the threshold or minimum changes', () => {
    const base = scenario();
    const raised = {
      ...base,
      medicines: { ...base.medicines, m4: { ...base.medicines.m4!, minStockLevel: 9 } },
    };
    expect(selectLowStock(raised, TODAY).map((v) => v.id)).toEqual(['m2', 'm1', 'm4']);
    expect(selectExpiringSoon(scenario(7), TODAY).map((v) => v.id)).toEqual([]);
    expect(selectExpiringSoon(scenario(60), TODAY).map((v) => v.id)).toEqual(['b3', 'b4']);
  });

  it('lists alert batches with quantity only', () => {
    const state = scenario();
    expect(selectExpiresToday(state, TODAY).map((v) => v.id)).toEqual(['b2']);
    expect(selectExpiringSoon(state, TODAY).map((v) => v.id)).toEqual(['b3']);
    expect(selectExpiringSoon(state, TODAY, { includeToday: true }).map((v) => v.id)).toEqual([
      'b2',
      'b3',
    ]);
    expect(selectExpired(state, TODAY).map((v) => v.id)).toEqual(['b5', 'b1']);
  });

  it('returns the same reference for the same inputs', () => {
    const state = scenario();
    expect(selectMedicineViews(state, TODAY)).toBe(
      selectMedicineViews(state, new Date(TODAY.getTime())),
    );
    expect(selectExpiringSoon(state, TODAY, { includeToday: true })).toBe(
      selectExpiringSoon(state, TODAY, { includeToday: true }),
    );
    const renamed = { ...state, settings: { ...state.settings, pharmacyName: 'Other' } };
    expect(selectMedicineViews(renamed, TODAY)).toBe(selectMedicineViews(state, TODAY));
    expect(selectMedicineViews(scenario(), TODAY)).not.toBe(selectMedicineViews(state, TODAY));
  });

  it('builds batch history with an opening row and running totals', () => {
    const transactions: StockTransaction[] = [
      {
        id: 't1',
        medicineId: 'm1',
        batchId: 'b3',
        type: 'STOCK_IN',
        quantityChange: 5,
        quantityAfter: 25,
        date: '2026-10-01T10:00:00.000Z',
      },
      {
        id: 't2',
        medicineId: 'm1',
        batchId: 'b4',
        type: 'STOCK_IN',
        quantityChange: 5,
        quantityAfter: 15,
        date: '2026-10-02T10:00:00.000Z',
      },
      {
        id: 't3',
        medicineId: 'm1',
        batchId: 'b3',
        type: 'ADJUSTMENT_DECREASE',
        quantityChange: -3,
        quantityAfter: 22,
        date: '2026-10-03T10:00:00.000Z',
        reason: 'DAMAGED',
        remarks: 'Torn',
      },
    ];
    const state = { ...scenario(), transactions };
    const rows = selectBatchHistory(state, 'b3');
    expect(rows.map((r) => [r.kind, r.quantityChange, r.quantityAfter])).toEqual([
      ['OPENING', 20, 20],
      ['STOCK_IN', 5, 25],
      ['ADJUSTMENT_DECREASE', -3, 22],
    ]);
    expect(rows[2]?.reason).toBe('DAMAGED');
    expect(rows[2]?.remarks).toBe('Torn');
    expect(rows[1]).not.toHaveProperty('reason');
    expect(selectBatchHistory(state, 'nope')).toEqual([]);
  });

  it('omits the opening row when the opening quantity is zero', () => {
    const state = makeState({
      medicines: [makeMedicine({ id: 'm1' })],
      batches: [makeBatch({ id: 'b1', medicineId: 'm1', openingQuantity: 0, quantity: 7 })],
      transactions: [
        {
          id: 't1',
          medicineId: 'm1',
          batchId: 'b1',
          type: 'BATCH_CREATED',
          quantityChange: 7,
          quantityAfter: 7,
          date: '2026-10-01T10:00:00.000Z',
        },
      ],
    });
    expect(selectBatchHistory(state, 'b1').map((r) => r.kind)).toEqual(['BATCH_CREATED']);
  });

  it('allows deleting only medicines without history', () => {
    const state = scenario();
    expect(canDeleteMedicine(state, 'm5')).toBe(true);
    expect(canDeleteMedicine(state, 'm1')).toBe(false);
    expect(canDeleteMedicine(state, 'unknown')).toBe(false);
    const withTx = {
      ...state,
      transactions: [
        {
          id: 't',
          medicineId: 'm5',
          batchId: 'b1',
          type: 'STOCK_IN' as const,
          quantityChange: 1,
          quantityAfter: 1,
          date: '2026-10-01T10:00:00.000Z',
        },
      ],
    };
    expect(canDeleteMedicine(withTx, 'm5')).toBe(false);
  });

  it('looks up medicines and their batches', () => {
    const state = scenario();
    expect(selectMedicineById(state, 'm1')?.name).toBe('Alpha');
    expect(selectMedicineById(state, 'zz')).toBeUndefined();
    expect(selectMedicineViewById(state, TODAY, 'm2')?.stock.expired).toBe(25);
    expect(selectMedicineViewById(state, TODAY, 'zz')).toBeUndefined();
    expect(selectBatchesForMedicine(state, TODAY, 'm4').map((v) => v.id)).toEqual(['b7', 'b8']);
    expect(selectBatchesForMedicine(state, TODAY, 'm4')).toBe(
      selectBatchesForMedicine(state, TODAY, 'm4'),
    );
  });
});
