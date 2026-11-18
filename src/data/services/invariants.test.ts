import { makeBatch, makeMedicine, makeState } from '@/data/testing/fixtures';
import type { InventoryState, StockTransaction } from '@/data/types';
import { InvariantError, assertInvariants } from './invariants';

function valid(): InventoryState {
  const transactions: StockTransaction[] = [
    {
      id: 't1',
      medicineId: 'm1',
      batchId: 'b1',
      type: 'STOCK_IN',
      quantityChange: 5,
      quantityAfter: 15,
      date: '2026-10-01T10:00:00.000Z',
    },
    {
      id: 't2',
      medicineId: 'm1',
      batchId: 'b1',
      type: 'ADJUSTMENT_DECREASE',
      quantityChange: -15,
      quantityAfter: 0,
      date: '2026-10-02T10:00:00.000Z',
      reason: 'DAMAGED',
    },
  ];
  return makeState({
    medicines: [makeMedicine({ id: 'm1' })],
    batches: [
      makeBatch({ id: 'b1', medicineId: 'm1', openingQuantity: 10, quantity: 0 }),
      makeBatch({ id: 'b2', medicineId: 'm1', quantity: 4 }),
    ],
    transactions,
  });
}

function mutate(change: (state: InventoryState) => void) {
  const state = structuredClone(valid());
  change(state);
  return () => assertInvariants(state);
}

describe('assertInvariants', () => {
  it('accepts a consistent state', () => {
    expect(() => assertInvariants(valid())).not.toThrow();
  });

  it.each<[string, (state: InventoryState) => void, RegExp]>([
    ['medicine key mismatch', (s) => void (s.medicines.m1!.id = 'other'), /Medicine key/],
    ['batch key mismatch', (s) => void (s.batches.b2!.id = 'other'), /Batch key/],
    ['missing medicine', (s) => void (s.batches.b2!.medicineId = 'zz'), /missing medicine/],
    ['negative quantity', (s) => void (s.batches.b2!.quantity = -1), /invalid quantity/],
    ['fractional quantity', (s) => void (s.batches.b2!.quantity = 1.5), /invalid quantity/],
    [
      'negative opening',
      (s) => void (s.batches.b2!.openingQuantity = -1),
      /invalid opening quantity/,
    ],
    [
      'duplicate batch number',
      (s) => void (s.batches.b2!.batchNumber = s.batches.b1!.batchNumber.toLowerCase()),
      /Duplicate batch number/,
    ],
    ['duplicate tx id', (s) => void (s.transactions[1]!.id = 't1'), /Duplicate transaction id/],
    ['missing batch', (s) => void (s.transactions[0]!.batchId = 'zz'), /missing batch/],
    [
      'medicine mismatch',
      (s) => {
        s.medicines.m2 = { ...s.medicines.m1!, id: 'm2' };
        s.transactions[0]!.medicineId = 'm2';
      },
      /does not match its batch/,
    ],
    [
      'wrong sign',
      (s) => void (s.transactions[0]!.type = 'ADJUSTMENT_DECREASE'),
      /invalid quantity change/,
    ],
    [
      'goes negative',
      (s) => {
        s.transactions[1]!.quantityChange = -16;
        s.transactions[1]!.quantityAfter = -1;
      },
      /negative/,
    ],
    ['broken chain', (s) => void (s.transactions[0]!.quantityAfter = 14), /broken quantity chain/],
    ['quantity mismatch', (s) => void (s.batches.b1!.quantity = 3), /does not match history/],
  ])('rejects %s', (_label, change, message) => {
    const run = mutate(change);
    expect(run).toThrow(InvariantError);
    expect(run).toThrow(message);
  });
});
