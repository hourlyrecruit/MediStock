import type { Batch, ID, InventoryState, Medicine, Result, StockTransaction } from '@/data/types';
import { inventoryApi } from './api/inventoryApi';
import { loadAppData } from './api/loader';
import { syncMutation } from './api/sync';
import { ok } from './services/result';
import { assertInvariants } from './services/invariants';
import {
  createMedicine,
  deleteMedicine,
  setMedicineActive,
  updateMedicine,
} from './services/medicines';
import type { UpdateMedicineInput } from './services/medicines';
import { addBatch, adjustStock, receiveStock } from './services/stock';
import { updateSettings } from './services/settings';
import type {
  AddBatchInput,
  AdjustStockInput,
  MedicineInput,
  ReceiveStockInput,
  SettingsInput,
} from './services/schemas';
import { useInventoryStore } from './store/inventoryStore';
import type { StockChangeResponse } from './api/contracts';

function commit<T extends { state: InventoryState }>(result: Result<T>): Result<T> {
  if (result.ok) {
    if (import.meta.env.DEV) assertInvariants(result.value.state);
    useInventoryStore.setState(result.value.state, true);
  }
  return result;
}

function current() {
  return useInventoryStore.getState();
}

function upsertMedicine(medicine: Medicine) {
  useInventoryStore.setState((state) => ({
    medicines: { ...state.medicines, [medicine.id]: medicine },
  }));
}

function upsertStockChange({ batch, transaction }: StockChangeResponse) {
  useInventoryStore.setState((state) => ({
    batches: { ...state.batches, [batch.id]: batch },
    transactions: replaceTransaction(state.transactions, transaction),
  }));
}

function replaceTransaction(list: StockTransaction[], next: StockTransaction) {
  const index = list.findIndex((tx) => tx.id === next.id);
  if (index === -1) return [...list, next];
  return list.map((tx, position) => (position === index ? next : tx));
}

function remarks(value: string | undefined) {
  return value ? { remarks: value } : {};
}

function stockIds(batch: Batch, transaction: StockTransaction) {
  return { batchId: batch.id, transactionId: transaction.id };
}

export const inventoryActions = {
  createMedicine: (input: MedicineInput) => {
    const result = commit(createMedicine(current(), input, new Date()));
    if (result.ok) {
      const { id, createdAt: _c, updatedAt: _u, ...fields } = result.value.medicine;
      syncMutation(() => inventoryApi.createMedicine({ id, ...fields }), upsertMedicine);
    }
    return result;
  },
  updateMedicine: (input: UpdateMedicineInput) => {
    const result = commit(updateMedicine(current(), input, new Date()));
    if (result.ok) {
      const { id, createdAt: _c, updatedAt: _u, ...fields } = result.value.medicine;
      syncMutation(() => inventoryApi.updateMedicine(id, fields), upsertMedicine);
    }
    return result;
  },
  setMedicineActive: (id: ID, isActive: boolean) => {
    const result = commit(setMedicineActive(current(), { id, isActive }, new Date()));
    if (result.ok) {
      syncMutation(() => inventoryApi.setMedicineActive(id, { isActive }), upsertMedicine);
    }
    return result;
  },
  deleteMedicine: (id: ID) => {
    const result = commit(deleteMedicine(current(), { id }));
    if (result.ok) syncMutation(() => inventoryApi.deleteMedicine(id));
    return result;
  },
  addBatch: (input: AddBatchInput) => {
    const result = commit(addBatch(current(), input, new Date()));
    if (result.ok) {
      const { batch, transaction } = result.value;
      syncMutation(
        () =>
          inventoryApi.createBatch({
            id: batch.id,
            transactionId: transaction.id,
            medicineId: batch.medicineId,
            batchNumber: batch.batchNumber,
            quantity: transaction.quantityChange,
            receivedDate: batch.receivedDate,
            expiryDate: batch.expiryDate,
            ...remarks(transaction.remarks),
          }),
        upsertStockChange,
      );
    }
    return result;
  },
  receiveStock: (input: ReceiveStockInput) => {
    const result = commit(receiveStock(current(), input, new Date()));
    if (result.ok) {
      const { batchId, transactionId } = stockIds(result.value.batch, result.value.transaction);
      syncMutation(
        () =>
          inventoryApi.receiveStock(batchId, {
            transactionId,
            quantity: input.quantity,
            date: input.date,
            ...remarks(result.value.transaction.remarks),
          }),
        upsertStockChange,
      );
    }
    return result;
  },
  adjustStock: (input: AdjustStockInput) => {
    const result = commit(adjustStock(current(), input, new Date()));
    if (result.ok) {
      const { batchId, transactionId } = stockIds(result.value.batch, result.value.transaction);
      syncMutation(
        () =>
          inventoryApi.adjustStock(batchId, {
            transactionId,
            direction: input.direction,
            quantity: input.quantity,
            reason: input.reason,
            ...remarks(result.value.transaction.remarks),
          }),
        upsertStockChange,
      );
    }
    return result;
  },
  updateSettings: (input: SettingsInput) => {
    const result = commit(updateSettings(current(), input));
    if (result.ok) {
      syncMutation(
        () => inventoryApi.updateSettings(input),
        (settings) => useInventoryStore.setState({ settings }),
      );
    }
    return result;
  },
  resetDemoData: async (): Promise<Result<{ state: InventoryState }>> => {
    await inventoryApi.resetDemoData();
    await loadAppData({ force: true });
    return ok({ state: current() });
  },
};

export type InventoryActions = typeof inventoryActions;

export function useInventoryActions(): InventoryActions {
  return inventoryActions;
}
