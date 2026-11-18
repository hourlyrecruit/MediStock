import type { ID, InventoryState, TransactionType } from '@/data/types';

export class InvariantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvariantError';
  }
}

const SIGN: Record<TransactionType, 1 | -1> = {
  STOCK_IN: 1,
  BATCH_CREATED: 1,
  ADJUSTMENT_INCREASE: 1,
  ADJUSTMENT_DECREASE: -1,
};

function fail(message: string): never {
  throw new InvariantError(message);
}

function isWholeNonNegative(value: number) {
  return Number.isInteger(value) && value >= 0;
}

export function assertInvariants(state: InventoryState): void {
  for (const [key, medicine] of Object.entries(state.medicines)) {
    if (medicine.id !== key) fail(`Medicine key ${key} does not match id ${medicine.id}`);
  }

  const batchNumbers = new Set<string>();
  for (const [key, batch] of Object.entries(state.batches)) {
    if (batch.id !== key) fail(`Batch key ${key} does not match id ${batch.id}`);
    if (!state.medicines[batch.medicineId]) {
      fail(`Batch ${batch.id} references missing medicine ${batch.medicineId}`);
    }
    if (!isWholeNonNegative(batch.quantity)) fail(`Batch ${batch.id} has invalid quantity`);
    if (!isWholeNonNegative(batch.openingQuantity)) {
      fail(`Batch ${batch.id} has invalid opening quantity`);
    }
    const numberKey = `${batch.medicineId}:${batch.batchNumber.toLowerCase()}`;
    if (batchNumbers.has(numberKey)) fail(`Duplicate batch number ${batch.batchNumber}`);
    batchNumbers.add(numberKey);
  }

  const running = new Map<ID, number>();
  const txIds = new Set<ID>();
  for (const tx of state.transactions) {
    if (txIds.has(tx.id)) fail(`Duplicate transaction id ${tx.id}`);
    txIds.add(tx.id);
    const batch = state.batches[tx.batchId];
    if (!batch) fail(`Transaction ${tx.id} references missing batch ${tx.batchId}`);
    if (batch.medicineId !== tx.medicineId) {
      fail(`Transaction ${tx.id} medicine does not match its batch`);
    }
    if (!Number.isInteger(tx.quantityChange) || tx.quantityChange * SIGN[tx.type] <= 0) {
      fail(`Transaction ${tx.id} has an invalid quantity change for ${tx.type}`);
    }
    const after = (running.get(tx.batchId) ?? batch.openingQuantity) + tx.quantityChange;
    if (after < 0) fail(`Transaction ${tx.id} drives batch ${batch.id} negative`);
    if (after !== tx.quantityAfter) fail(`Transaction ${tx.id} has a broken quantity chain`);
    running.set(tx.batchId, after);
  }

  for (const batch of Object.values(state.batches)) {
    const expected = running.get(batch.id) ?? batch.openingQuantity;
    if (expected !== batch.quantity) {
      fail(`Batch ${batch.id} quantity ${batch.quantity} does not match history ${expected}`);
    }
  }
}
