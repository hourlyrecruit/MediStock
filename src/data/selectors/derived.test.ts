import { REPORT_IDS } from '@/data/types';
import type { StockTransaction } from '@/data/types';
import { demoInventory } from '@/data/testing/demo';
import { FIXED_TODAY, makeBatch, makeMedicine, makeState } from '@/data/testing/fixtures';
import { selectCategoryDistribution, selectMonthlyAdditions } from './charts';
import { selectKpis } from './kpis';
import { memoizeByRef } from './memo';
import { selectNotifications } from './notifications';
import { selectReportRows } from './reports';
import { selectTransactionViews } from './transactions';

const TODAY = FIXED_TODAY;

function tx(overrides: Partial<StockTransaction> & { id: string }): StockTransaction {
  return {
    medicineId: 'm1',
    batchId: 'b1',
    type: 'STOCK_IN',
    quantityChange: 1,
    quantityAfter: 1,
    date: '2026-10-01T10:00:00.000Z',
    ...overrides,
  };
}

function scenario() {
  return makeState({
    medicines: [
      makeMedicine({
        id: 'm1',
        name: 'Alpha',
        unitPrice: 2.5,
        minStockLevel: 100,
        category: 'Antibiotics',
      }),
      makeMedicine({ id: 'm2', name: 'Beta', unitPrice: 10, minStockLevel: 1 }),
      makeMedicine({ id: 'm3', name: '=Gamma', isActive: false, minStockLevel: 500 }),
    ],
    batches: [
      makeBatch({ id: 'b1', medicineId: 'm1', daysLeft: 0, quantity: 1, batchNumber: 'A-1' }),
      makeBatch({ id: 'b2', medicineId: 'm1', daysLeft: -1, quantity: 6, batchNumber: 'A-2' }),
      makeBatch({ id: 'b3', medicineId: 'm2', daysLeft: 1, quantity: 4, batchNumber: 'B-1' }),
      makeBatch({ id: 'b4', medicineId: 'm2', daysLeft: 90, quantity: 10, batchNumber: 'B-2' }),
      makeBatch({ id: 'b5', medicineId: 'm2', daysLeft: -30, quantity: 1, batchNumber: 'B-3' }),
    ],
  });
}

describe('selectKpis', () => {
  it('summarises the inventory', () => {
    expect(selectKpis(scenario(), TODAY)).toEqual({
      totalMedicines: 3,
      activeMedicines: 2,
      usableUnits: 15,
      usableStockValue: 142.5,
      lowStockCount: 1,
      expiresTodayCount: 1,
      expiringSoonCount: 1,
      expiredCount: 2,
      expiredUnits: 7,
    });
  });

  it('matches the seed expectations', () => {
    const kpis = selectKpis(demoInventory(TODAY), TODAY);
    expect(kpis.totalMedicines).toBe(25);
    expect(kpis.activeMedicines).toBe(21);
    expect(kpis.expiresTodayCount).toBe(2);
    expect(kpis.expiringSoonCount).toBe(6);
    expect(kpis.expiredCount).toBe(8);
    expect(kpis.lowStockCount).toBeGreaterThanOrEqual(6);
  });
});

describe('charts', () => {
  it('distributes medicines by category in canonical order', () => {
    expect(selectCategoryDistribution(scenario(), TODAY)).toEqual([
      { category: 'Analgesics', medicines: 2, usableUnits: 14 },
      { category: 'Antibiotics', medicines: 1, usableUnits: 1 },
    ]);
  });

  it('sums monthly additions with zero-filled months', () => {
    const state = {
      ...scenario(),
      transactions: [
        tx({ id: 't1', type: 'BATCH_CREATED', quantityChange: 10, date: '2026-10-05T10:00:00' }),
        tx({ id: 't2', type: 'STOCK_IN', quantityChange: 5, date: '2026-10-20T10:00:00' }),
        tx({
          id: 't3',
          type: 'ADJUSTMENT_INCREASE',
          quantityChange: 2,
          date: '2026-08-02T10:00:00',
        }),
        tx({
          id: 't4',
          type: 'ADJUSTMENT_DECREASE',
          quantityChange: -4,
          date: '2026-10-21T10:00:00',
        }),
        tx({ id: 't5', type: 'STOCK_IN', quantityChange: 99, date: '2026-01-02T10:00:00' }),
      ],
    };
    const months = selectMonthlyAdditions(state, TODAY);
    expect(months).toEqual([
      { month: '2026-05', label: 'May', units: 0 },
      { month: '2026-06', label: 'Jun', units: 0 },
      { month: '2026-07', label: 'Jul', units: 0 },
      { month: '2026-08', label: 'Aug', units: 2 },
      { month: '2026-09', label: 'Sep', units: 0 },
      { month: '2026-10', label: 'Oct', units: 15 },
    ]);
    expect(selectMonthlyAdditions(state, TODAY, 3).map((m) => m.month)).toEqual([
      '2026-08',
      '2026-09',
      '2026-10',
    ]);
    expect(selectMonthlyAdditions(state, TODAY)).toBe(months);
  });

  it('charts seeded additions inside the window', () => {
    const months = selectMonthlyAdditions(demoInventory(TODAY), TODAY);
    expect(months).toHaveLength(6);
    expect(months.reduce((sum, m) => sum + m.units, 0)).toBeGreaterThan(0);
  });
});

describe('selectNotifications', () => {
  it('orders today, expired, low stock then expiring soon', () => {
    const { items, count } = selectNotifications(scenario(), TODAY);
    expect(items.map((i) => i.kind)).toEqual([
      'EXPIRES_TODAY',
      'EXPIRED',
      'EXPIRED',
      'LOW_STOCK',
      'EXPIRING_SOON',
    ]);
    expect(count).toBe(5);
    expect(items[0]?.href).toBe('/expiry?status=expires-today&q=A-1');
    expect(items[0]?.detail).toBe('Batch A-1 · 1 unit');
    expect(items[1]?.href).toBe('/expiry?status=expired&q=B-3');
    expect(items[1]?.detail).toContain('30 days ago');
    expect(items[2]?.detail).toContain('1 day ago');
    expect(items[3]?.href).toBe('/medicines/m1');
    expect(items[3]?.title).toBe('Alpha is low on stock');
    expect(items[4]?.detail).toContain('1 day left');
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
  });

  it('uses plural wording', () => {
    const state = makeState({
      medicines: [makeMedicine({ id: 'm1', minStockLevel: 0 })],
      batches: [makeBatch({ id: 'b1', medicineId: 'm1', daysLeft: 3, quantity: 2 })],
    });
    const { items } = selectNotifications(state, TODAY);
    expect(items[0]?.detail).toContain('2 units');
    expect(items[0]?.detail).toContain('3 days left');
  });
});

describe('selectTransactionViews', () => {
  it('joins names and sorts newest first', () => {
    const state = {
      ...scenario(),
      transactions: [
        tx({ id: 't1', date: '2026-10-01T10:00:00.000Z' }),
        tx({ id: 't2', date: '2026-10-03T10:00:00.000Z', batchId: 'b3', medicineId: 'm2' }),
        tx({ id: 't3', date: '2026-10-01T10:00:00.000Z' }),
        tx({ id: 't4', date: '2026-10-02T10:00:00.000Z', batchId: 'gone', medicineId: 'gone' }),
      ],
    };
    const views = selectTransactionViews(state);
    expect(views.map((v) => v.id)).toEqual(['t2', 't4', 't3', 't1']);
    expect(views[0]?.medicineName).toBe('Beta');
    expect(views[0]?.batchNumber).toBe('B-1');
    expect(views[1]?.medicineName).toBe('Unknown medicine');
    expect(views[1]?.batchNumber).toBe('Unknown batch');
  });
});

describe('selectReportRows', () => {
  it.each(REPORT_IDS)('produces aligned columns and rows for %s', (reportId) => {
    const state = demoInventory(TODAY);
    const report = selectReportRows(state, TODAY, reportId);
    expect(report.columns.length).toBeGreaterThan(0);
    expect(report.rows.length).toBeGreaterThan(0);
    const keys = report.columns.map((c) => c.key);
    for (const row of report.rows) expect(Object.keys(row)).toEqual(keys);
    expect(selectReportRows(state, TODAY, reportId)).toBe(report);
  });

  it('keeps numbers numeric and formats dates', () => {
    const state = scenario();
    const catalogue = selectReportRows(state, TODAY, 'catalogue');
    expect(catalogue.rows[0]).toMatchObject({ name: '=Gamma', status: 'Inactive' });
    expect(catalogue.rows[1]).toMatchObject({ name: 'Alpha', unitPrice: 2.5, usable: 1 });

    const usable = selectReportRows(state, TODAY, 'usable-stock');
    expect(usable.rows).toEqual([
      {
        name: 'Alpha',
        category: 'Antibiotics',
        usable: 1,
        unitPrice: 2.5,
        value: 2.5,
        nextExpiry: '31 Oct 2026',
      },
      {
        name: 'Beta',
        category: 'Analgesics',
        usable: 14,
        unitPrice: 10,
        value: 140,
        nextExpiry: '01 Nov 2026',
      },
    ]);

    const low = selectReportRows(state, TODAY, 'low-stock');
    expect(low.rows).toEqual([
      { name: 'Alpha', category: 'Antibiotics', usable: 1, minStockLevel: 100, shortfall: 99 },
    ]);

    const soon = selectReportRows(state, TODAY, 'expiring-soon');
    expect(soon.rows.map((r) => r.status)).toEqual(['Expires Today', 'Expiring Soon']);
    expect(soon.rows[0]).toMatchObject({ expiryDate: '31 Oct 2026', daysLeft: 0, value: 2.5 });

    const expired = selectReportRows(state, TODAY, 'expired');
    expect(expired.rows.map((r) => r.batchNumber)).toEqual(['B-3', 'A-2']);

    const withTx = {
      ...state,
      transactions: [
        tx({
          id: 't1',
          type: 'ADJUSTMENT_DECREASE',
          quantityChange: -1,
          quantityAfter: 0,
          reason: 'DAMAGED',
          remarks: 'Broken',
          date: '2026-10-02T10:00:00',
        }),
        tx({ id: 't2', date: '2026-10-01T10:00:00' }),
      ],
    };
    const history = selectReportRows(withTx, TODAY, 'transactions');
    expect(history.rows).toEqual([
      {
        date: '02 Oct 2026',
        medicine: 'Alpha',
        batchNumber: 'A-1',
        type: 'Adjustment −',
        quantityChange: -1,
        quantityAfter: 0,
        reason: 'Damaged',
        remarks: 'Broken',
      },
      {
        date: '01 Oct 2026',
        medicine: 'Alpha',
        batchNumber: 'A-1',
        type: 'Stock In',
        quantityChange: 1,
        quantityAfter: 1,
        reason: '',
        remarks: '',
      },
    ]);
  });
});

describe('memoizeByRef', () => {
  it('caches by key and evicts the least recently used entry', () => {
    const fn = vi.fn((a: object, n: number) => ({ a, n }));
    const memo = memoizeByRef(fn, (a, n) => [a, n], 2);
    const key = {};
    const first = memo(key, 1);
    expect(memo(key, 1)).toBe(first);
    memo(key, 2);
    expect(memo(key, 1)).toBe(first);
    memo(key, 3);
    expect(fn).toHaveBeenCalledTimes(3);
    memo(key, 2);
    expect(fn).toHaveBeenCalledTimes(4);
    expect(memo({}, 1)).not.toBe(first);
  });
});
