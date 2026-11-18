import { parseISO, setHours } from 'date-fns';
import type { Batch, InventoryState, Result, StockTransaction } from '@/data/types';
import { daysUntilExpiry } from '@/data/selectors/expiry';
import { createId, err, ok, validationError } from './result';
import { adjustStockSchema, makeAddBatchSchema, makeReceiveStockSchema, todayISO } from './schemas';
import type { AddBatchInput, AdjustStockInput, ReceiveStockInput } from './schemas';

export interface StockChange {
  state: InventoryState;
  batch: Batch;
  transaction: StockTransaction;
}

function remarksOf(value: string | undefined) {
  return value ? { remarks: value } : {};
}

function applyChange(
  state: InventoryState,
  batch: Batch,
  transaction: StockTransaction,
): StockChange {
  return {
    state: {
      ...state,
      batches: { ...state.batches, [batch.id]: batch },
      transactions: [...state.transactions, transaction],
    },
    batch,
    transaction,
  };
}

function transactionDate(date: string, now: Date) {
  return date === todayISO(now) ? now.toISOString() : setHours(parseISO(date), 12).toISOString();
}

export function addBatch(
  state: InventoryState,
  input: AddBatchInput,
  now: Date,
): Result<StockChange> {
  const parsed = makeAddBatchSchema(now).safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const data = parsed.data;
  const medicine = state.medicines[data.medicineId];
  if (!medicine) return err('NOT_FOUND', 'Medicine not found', 'medicineId');
  if (!medicine.isActive) {
    return err(
      'MEDICINE_INACTIVE',
      `${medicine.name} is inactive. Activate it first.`,
      'medicineId',
    );
  }
  const batchNumber = data.batchNumber.toUpperCase();
  const duplicate = Object.values(state.batches).some(
    (batch) => batch.medicineId === medicine.id && batch.batchNumber.toUpperCase() === batchNumber,
  );
  if (duplicate) {
    return err(
      'DUPLICATE_BATCH',
      `Batch ${batchNumber} already exists for ${medicine.name}`,
      'batchNumber',
    );
  }
  const timestamp = now.toISOString();
  const batch: Batch = {
    id: createId('bat'),
    medicineId: medicine.id,
    batchNumber,
    openingQuantity: 0,
    quantity: data.quantity,
    expiryDate: data.expiryDate,
    receivedDate: data.receivedDate,
    createdAt: timestamp,
  };
  const transaction: StockTransaction = {
    id: createId('txn'),
    medicineId: medicine.id,
    batchId: batch.id,
    type: 'BATCH_CREATED',
    quantityChange: data.quantity,
    quantityAfter: data.quantity,
    date: timestamp,
    ...remarksOf(data.remarks),
  };
  return ok(applyChange(state, batch, transaction));
}

export function receiveStock(
  state: InventoryState,
  input: ReceiveStockInput,
  now: Date,
): Result<StockChange> {
  const parsed = makeReceiveStockSchema(now).safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const data = parsed.data;
  const existing = state.batches[data.batchId];
  if (!existing) return err('NOT_FOUND', 'Batch not found', 'batchId');
  if (daysUntilExpiry(existing, now) < 0) {
    return err('BATCH_EXPIRED', `Batch ${existing.batchNumber} has expired`, 'batchId');
  }
  if (data.date < existing.receivedDate) {
    return err('VALIDATION', 'Date cannot be before the batch was received', 'date');
  }
  const batch: Batch = { ...existing, quantity: existing.quantity + data.quantity };
  const transaction: StockTransaction = {
    id: createId('txn'),
    medicineId: batch.medicineId,
    batchId: batch.id,
    type: 'STOCK_IN',
    quantityChange: data.quantity,
    quantityAfter: batch.quantity,
    date: transactionDate(data.date, now),
    ...remarksOf(data.remarks),
  };
  return ok(applyChange(state, batch, transaction));
}

export function adjustStock(
  state: InventoryState,
  input: AdjustStockInput,
  now: Date,
): Result<StockChange> {
  const parsed = adjustStockSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const data = parsed.data;
  const existing = state.batches[data.batchId];
  if (!existing) return err('NOT_FOUND', 'Batch not found', 'batchId');
  const increase = data.direction === 'INCREASE';
  if (increase && daysUntilExpiry(existing, now) < 0) {
    return err('BATCH_EXPIRED', `Batch ${existing.batchNumber} has expired`, 'batchId');
  }
  if (!increase && data.quantity > existing.quantity) {
    return err(
      'NEGATIVE_STOCK',
      `Only ${existing.quantity} units are available in batch ${existing.batchNumber}`,
      'quantity',
    );
  }
  const quantityChange = increase ? data.quantity : -data.quantity;
  const batch: Batch = { ...existing, quantity: existing.quantity + quantityChange };
  const transaction: StockTransaction = {
    id: createId('txn'),
    medicineId: batch.medicineId,
    batchId: batch.id,
    type: increase ? 'ADJUSTMENT_INCREASE' : 'ADJUSTMENT_DECREASE',
    quantityChange,
    quantityAfter: batch.quantity,
    date: now.toISOString(),
    reason: data.reason,
    ...remarksOf(data.remarks),
  };
  return ok(applyChange(state, batch, transaction));
}
