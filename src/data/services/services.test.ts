import { demoInventory } from '@/data/testing/demo';
import { mulberry32, randomInt } from '@/data/testing/prng';
import { selectBatchViews, selectStockByMedicine } from '@/data/selectors';
import {
  FIXED_NOW,
  FIXED_TODAY,
  isoIn,
  makeBatch,
  makeMedicine,
  makeState,
} from '@/data/testing/fixtures';
import type { DomainErrorCode, InventoryState, Result } from '@/data/types';
import { assertInvariants } from './invariants';
import { createMedicine, deleteMedicine, setMedicineActive, updateMedicine } from './medicines';
import { createId, err, ok } from './result';
import type { MedicineInput, SettingsInput } from './schemas';
import { updateSettings } from './settings';
import { addBatch, adjustStock, receiveStock } from './stock';

const NOW = FIXED_NOW;

function expectOk<T>(result: Result<T>): T {
  if (!result.ok) throw new Error(`Expected ok, got ${result.error.code}: ${result.error.message}`);
  return result.value;
}

function expectErr<T>(result: Result<T>, code: DomainErrorCode, field?: string) {
  expect(result.ok).toBe(false);
  if (result.ok) return;
  expect(result.error.code).toBe(code);
  if (field) expect(result.error.field).toBe(field);
}

const medicineInput: MedicineInput = {
  name: 'Testocin 250',
  genericName: 'Testocillin',
  category: 'Antibiotics',
  manufacturer: 'Acme Labs',
  unitPrice: 12.5,
  minStockLevel: 20,
  description: 'Test medicine',
  isActive: true,
};

function baseState() {
  return makeState({
    medicines: [
      makeMedicine({ id: 'm1', name: 'Alpha', genericName: 'Alphamol' }),
      makeMedicine({ id: 'm2', name: 'Beta', genericName: 'Betamol', isActive: false }),
      makeMedicine({ id: 'm3', name: 'Gamma', genericName: 'Gammamol' }),
    ],
    batches: [
      makeBatch({ id: 'b1', medicineId: 'm1', batchNumber: 'ALP-1', quantity: 10, daysLeft: 100 }),
      makeBatch({ id: 'b2', medicineId: 'm1', batchNumber: 'ALP-2', quantity: 5, daysLeft: -2 }),
      makeBatch({ id: 'b3', medicineId: 'm1', batchNumber: 'ALP-3', quantity: 3, daysLeft: 0 }),
    ],
  });
}

describe('result helpers', () => {
  it('builds ok and err results', () => {
    expect(ok(1)).toEqual({ ok: true, value: 1 });
    expect(err('NOT_FOUND', 'Missing')).toEqual({
      ok: false,
      error: { code: 'NOT_FOUND', message: 'Missing' },
    });
    expect(err('VALIDATION', 'Bad', 'name')).toEqual({
      ok: false,
      error: { code: 'VALIDATION', message: 'Bad', field: 'name' },
    });
    expect(createId('med')).toMatch(/^med_[0-9a-f-]{36}$/);
  });

  it('reports whole-input validation errors without a field', () => {
    const result = updateSettings(baseState(), null as unknown as SettingsInput);
    expect(result).toMatchObject({ ok: false, error: { code: 'VALIDATION' } });
    expect(result.ok ? null : result.error.field).toBeUndefined();
  });
});

describe('medicine services', () => {
  it('creates a medicine', () => {
    const state = baseState();
    const { state: next, medicine } = expectOk(createMedicine(state, medicineInput, NOW));
    expect(next.medicines[medicine.id]).toEqual(medicine);
    expect(medicine.createdAt).toBe(NOW.toISOString());
    expect(Object.keys(next.medicines)).toHaveLength(4);
    expect(Object.keys(state.medicines)).toHaveLength(3);
    expect(next.batches).toBe(state.batches);
    assertInvariants(next);
  });

  it('trims input', () => {
    const { medicine } = expectOk(
      createMedicine(baseState(), { ...medicineInput, name: '  Spaced  ' }, NOW),
    );
    expect(medicine.name).toBe('Spaced');
  });

  it('rejects duplicates case-insensitively', () => {
    expectErr(
      createMedicine(
        baseState(),
        { ...medicineInput, name: 'ALPHA ', genericName: 'alphamol' },
        NOW,
      ),
      'DUPLICATE_MEDICINE',
      'name',
    );
  });

  it.each([
    ['name', { name: 'A' }],
    ['genericName', { genericName: 'x'.repeat(81) }],
    ['unitPrice', { unitPrice: 0 }],
    ['unitPrice', { unitPrice: 1.234 }],
    ['unitPrice', { unitPrice: 100001 }],
    ['minStockLevel', { minStockLevel: -1 }],
    ['minStockLevel', { minStockLevel: 1.5 }],
    ['description', { description: 'x'.repeat(501) }],
    ['category', { category: 'Unknown' }],
  ])('rejects invalid %s', (field, patch) => {
    const input = { ...medicineInput, ...patch } as MedicineInput;
    expectErr(createMedicine(baseState(), input, NOW), 'VALIDATION', field);
  });

  it('accepts two-decimal prices', () => {
    expectOk(createMedicine(baseState(), { ...medicineInput, unitPrice: 19.99 }, NOW));
    expectOk(createMedicine(baseState(), { ...medicineInput, unitPrice: 0.1 + 0.2 }, NOW));
  });

  it('updates a medicine and bumps updatedAt', () => {
    const state = baseState();
    const { state: next, medicine } = expectOk(
      updateMedicine(state, { id: 'm1', ...medicineInput, name: 'Alpha Forte' }, NOW),
    );
    expect(medicine.name).toBe('Alpha Forte');
    expect(medicine.createdAt).toBe(state.medicines.m1?.createdAt);
    expect(medicine.updatedAt).toBe(NOW.toISOString());
    expect(next.medicines.m1).toEqual(medicine);
  });

  it('allows keeping its own name but rejects clashing with another', () => {
    expectOk(
      updateMedicine(
        baseState(),
        { id: 'm1', ...medicineInput, name: 'Alpha', genericName: 'Alphamol' },
        NOW,
      ),
    );
    expectErr(
      updateMedicine(
        baseState(),
        { id: 'm1', ...medicineInput, name: 'Gamma', genericName: 'Gammamol' },
        NOW,
      ),
      'DUPLICATE_MEDICINE',
    );
    expectErr(updateMedicine(baseState(), { id: 'nope', ...medicineInput }, NOW), 'NOT_FOUND');
    expectErr(
      updateMedicine(baseState(), { id: 'm1', ...medicineInput, name: '' }, NOW),
      'VALIDATION',
      'name',
    );
  });

  it('toggles active and returns the previous value', () => {
    const result = expectOk(setMedicineActive(baseState(), { id: 'm1', isActive: false }, NOW));
    expect(result.previous).toBe(true);
    expect(result.medicine.isActive).toBe(false);
    expect(result.state.medicines.m1?.isActive).toBe(false);
    expectErr(setMedicineActive(baseState(), { id: 'x', isActive: true }, NOW), 'NOT_FOUND');
    expectErr(
      setMedicineActive(baseState(), { id: 'm1', isActive: 'yes' as unknown as boolean }, NOW),
      'VALIDATION',
      'isActive',
    );
  });

  it('deletes only medicines without history', () => {
    const { state: next, medicine } = expectOk(deleteMedicine(baseState(), { id: 'm3' }));
    expect(medicine.id).toBe('m3');
    expect(next.medicines.m3).toBeUndefined();
    expectErr(deleteMedicine(baseState(), { id: 'm1' }), 'MEDICINE_HAS_HISTORY');
    expectErr(deleteMedicine(baseState(), { id: 'zz' }), 'NOT_FOUND');
  });
});

describe('addBatch', () => {
  const input = {
    medicineId: 'm1',
    batchNumber: 'alp-9',
    quantity: 40,
    receivedDate: isoIn(0),
    expiryDate: isoIn(200),
    remarks: 'First delivery',
  };

  it('creates a batch with a BATCH_CREATED transaction', () => {
    const state = baseState();
    const { state: next, batch, transaction } = expectOk(addBatch(state, input, NOW));
    expect(batch).toMatchObject({
      medicineId: 'm1',
      batchNumber: 'ALP-9',
      openingQuantity: 0,
      quantity: 40,
    });
    expect(transaction).toMatchObject({
      batchId: batch.id,
      type: 'BATCH_CREATED',
      quantityChange: 40,
      quantityAfter: 40,
      remarks: 'First delivery',
      date: NOW.toISOString(),
    });
    expect(next.transactions).toHaveLength(state.transactions.length + 1);
    assertInvariants(next);
  });

  it('omits empty remarks', () => {
    const { transaction } = expectOk(addBatch(baseState(), { ...input, remarks: '' }, NOW));
    expect(transaction).not.toHaveProperty('remarks');
  });

  it('rejects duplicates, inactive and unknown medicines', () => {
    expectErr(addBatch(baseState(), { ...input, batchNumber: 'alp-1' }, NOW), 'DUPLICATE_BATCH');
    expectErr(addBatch(baseState(), { ...input, medicineId: 'm2' }, NOW), 'MEDICINE_INACTIVE');
    expectErr(addBatch(baseState(), { ...input, medicineId: 'zz' }, NOW), 'NOT_FOUND');
    expectOk(addBatch(baseState(), { ...input, medicineId: 'm3', batchNumber: 'ALP-1' }, NOW));
  });

  it.each([
    ['batchNumber', { batchNumber: 'A' }],
    ['batchNumber', { batchNumber: 'AB 12' }],
    ['quantity', { quantity: 0 }],
    ['quantity', { quantity: 100001 }],
    ['quantity', { quantity: 2.5 }],
    ['receivedDate', { receivedDate: isoIn(1) }],
    ['receivedDate', { receivedDate: 'not-a-date' }],
    ['expiryDate', { expiryDate: isoIn(0) }],
    ['expiryDate', { expiryDate: isoIn(-5) }],
    ['remarks', { remarks: 'x'.repeat(201) }],
  ])('rejects invalid %s', (field, patch) => {
    expectErr(addBatch(baseState(), { ...input, ...patch }, NOW), 'VALIDATION', field);
  });
});

describe('receiveStock', () => {
  it('adds stock with a STOCK_IN transaction', () => {
    const { state, batch, transaction } = expectOk(
      receiveStock(baseState(), { batchId: 'b1', quantity: 15, date: isoIn(0) }, NOW),
    );
    expect(batch.quantity).toBe(25);
    expect(transaction).toMatchObject({
      type: 'STOCK_IN',
      quantityChange: 15,
      quantityAfter: 25,
      date: NOW.toISOString(),
    });
    expect(transaction).not.toHaveProperty('remarks');
    assertInvariants(state);
  });

  it('backdates to midday of an earlier date', () => {
    const { transaction } = expectOk(
      receiveStock(
        baseState(),
        { batchId: 'b1', quantity: 1, date: isoIn(-3), remarks: 'Late entry' },
        NOW,
      ),
    );
    expect(new Date(transaction.date).getHours()).toBe(12);
    expect(transaction.remarks).toBe('Late entry');
  });

  it('allows receiving into a batch that expires today', () => {
    expectOk(receiveStock(baseState(), { batchId: 'b3', quantity: 1, date: isoIn(0) }, NOW));
  });

  it('rejects expired, missing and invalid input', () => {
    expectErr(
      receiveStock(baseState(), { batchId: 'b2', quantity: 1, date: isoIn(0) }, NOW),
      'BATCH_EXPIRED',
    );
    expectErr(
      receiveStock(baseState(), { batchId: 'zz', quantity: 1, date: isoIn(0) }, NOW),
      'NOT_FOUND',
    );
    expectErr(
      receiveStock(baseState(), { batchId: 'b1', quantity: 0, date: isoIn(0) }, NOW),
      'VALIDATION',
      'quantity',
    );
    expectErr(
      receiveStock(baseState(), { batchId: 'b1', quantity: 1, date: isoIn(1) }, NOW),
      'VALIDATION',
      'date',
    );
    expectErr(
      receiveStock(baseState(), { batchId: 'b1', quantity: 1, date: isoIn(-400) }, NOW),
      'VALIDATION',
      'date',
    );
  });
});

describe('adjustStock', () => {
  it('decreases stock with a reason', () => {
    const { state, batch, transaction } = expectOk(
      adjustStock(
        baseState(),
        { batchId: 'b1', direction: 'DECREASE', quantity: 10, reason: 'DAMAGED' },
        NOW,
      ),
    );
    expect(batch.quantity).toBe(0);
    expect(transaction).toMatchObject({
      type: 'ADJUSTMENT_DECREASE',
      quantityChange: -10,
      quantityAfter: 0,
      reason: 'DAMAGED',
    });
    assertInvariants(state);
  });

  it('increases stock', () => {
    const { transaction } = expectOk(
      adjustStock(
        baseState(),
        { batchId: 'b1', direction: 'INCREASE', quantity: 2, reason: 'RETURNED', remarks: 'Back' },
        NOW,
      ),
    );
    expect(transaction).toMatchObject({
      type: 'ADJUSTMENT_INCREASE',
      quantityChange: 2,
      quantityAfter: 12,
      remarks: 'Back',
    });
  });

  it('allows writing off expired stock', () => {
    const { batch } = expectOk(
      adjustStock(
        baseState(),
        { batchId: 'b2', direction: 'DECREASE', quantity: 5, reason: 'EXPIRED_DISPOSED' },
        NOW,
      ),
    );
    expect(batch.quantity).toBe(0);
  });

  it('rejects negative stock, expired increases and bad input', () => {
    expectErr(
      adjustStock(
        baseState(),
        { batchId: 'b1', direction: 'DECREASE', quantity: 11, reason: 'DAMAGED' },
        NOW,
      ),
      'NEGATIVE_STOCK',
      'quantity',
    );
    expectErr(
      adjustStock(
        baseState(),
        { batchId: 'b2', direction: 'INCREASE', quantity: 1, reason: 'COUNT_CORRECTION' },
        NOW,
      ),
      'BATCH_EXPIRED',
    );
    expectErr(
      adjustStock(
        baseState(),
        { batchId: 'zz', direction: 'INCREASE', quantity: 1, reason: 'COUNT_CORRECTION' },
        NOW,
      ),
      'NOT_FOUND',
    );
    expectErr(
      adjustStock(
        baseState(),
        { batchId: 'b1', direction: 'INCREASE', quantity: 1, reason: 'OTHER', remarks: 'ok' },
        NOW,
      ),
      'VALIDATION',
      'remarks',
    );
    expectErr(
      adjustStock(
        baseState(),
        { batchId: 'b1', direction: 'INCREASE', quantity: 1, reason: 'OTHER' },
        NOW,
      ),
      'VALIDATION',
      'remarks',
    );
    expectOk(
      adjustStock(
        baseState(),
        { batchId: 'b1', direction: 'INCREASE', quantity: 1, reason: 'OTHER', remarks: 'Audit' },
        NOW,
      ),
    );
  });
});

describe('settings services', () => {
  it('updates settings', () => {
    const { state, settings } = expectOk(
      updateSettings(baseState(), { pharmacyName: 'New Name', expiryAlertDays: 60 }),
    );
    expect(settings).toEqual({ pharmacyName: 'New Name', currency: 'INR', expiryAlertDays: 60 });
    expect(state.settings).toBe(settings);
  });

  it.each([
    ['pharmacyName', { pharmacyName: 'X', expiryAlertDays: 30 }],
    ['expiryAlertDays', { pharmacyName: 'Valid', expiryAlertDays: 0 }],
    ['expiryAlertDays', { pharmacyName: 'Valid', expiryAlertDays: 366 }],
    ['expiryAlertDays', { pharmacyName: 'Valid', expiryAlertDays: 2.5 }],
  ])('rejects invalid %s', (field, input) => {
    expectErr(updateSettings(baseState(), input), 'VALIDATION', field);
  });

  it('threshold change reclassifies batches', () => {
    const seed = demoInventory(FIXED_TODAY);
    const { state } = expectOk(
      updateSettings(seed, { pharmacyName: seed.settings.pharmacyName, expiryAlertDays: 365 }),
    );
    const before = selectBatchViews(seed, FIXED_TODAY).filter((v) => v.status === 'EXPIRING_SOON');
    const after = selectBatchViews(state, FIXED_TODAY).filter((v) => v.status === 'EXPIRING_SOON');
    expect(after.length).toBeGreaterThan(before.length);
  });
});

describe('property: random service sequences keep invariants', () => {
  it('never produces negative stock or broken chains', () => {
    const prng = mulberry32(99);
    let state: InventoryState = demoInventory(FIXED_TODAY);
    const reasons = ['DAMAGED', 'EXPIRED_DISPOSED', 'COUNT_CORRECTION', 'RETURNED'] as const;
    let applied = 0;
    for (let step = 0; step < 400; step += 1) {
      const batchIds = Object.keys(state.batches);
      const medicineIds = Object.keys(state.medicines);
      const batchId = batchIds[randomInt(prng, 0, batchIds.length - 1)] as string;
      const before = state.transactions.length;
      const action = randomInt(prng, 0, 3);
      let result: Result<{ state: InventoryState }>;
      if (action === 0) {
        result = receiveStock(
          state,
          { batchId, quantity: randomInt(prng, 1, 50), date: isoIn(0) },
          NOW,
        );
      } else if (action === 1) {
        result = adjustStock(
          state,
          {
            batchId,
            direction: prng() < 0.5 ? 'INCREASE' : 'DECREASE',
            quantity: randomInt(prng, 1, 120),
            reason: reasons[randomInt(prng, 0, reasons.length - 1)] ?? 'DAMAGED',
          },
          NOW,
        );
      } else if (action === 2) {
        result = addBatch(
          state,
          {
            medicineId: medicineIds[randomInt(prng, 0, medicineIds.length - 1)] as string,
            batchNumber: `RND-${step}`,
            quantity: randomInt(prng, 1, 100),
            receivedDate: isoIn(-randomInt(prng, 0, 30)),
            expiryDate: isoIn(randomInt(prng, 1, 700)),
          },
          NOW,
        );
      } else {
        const id = medicineIds[randomInt(prng, 0, medicineIds.length - 1)] as string;
        result = setMedicineActive(state, { id, isActive: prng() < 0.7 }, NOW);
      }
      if (result.ok) {
        const delta = result.value.state.transactions.length - before;
        expect(delta).toBe(action === 3 ? 0 : 1);
        state = result.value.state;
        applied += 1;
      } else {
        expect(['NEGATIVE_STOCK', 'BATCH_EXPIRED', 'MEDICINE_INACTIVE']).toContain(
          result.error.code,
        );
      }
      assertInvariants(state);
      for (const summary of Object.values(selectStockByMedicine(state, FIXED_TODAY))) {
        expect(summary.usable).toBeGreaterThanOrEqual(0);
      }
    }
    expect(applied).toBeGreaterThan(100);
  });
});
