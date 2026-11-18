import { useCallback, useMemo } from 'react';
import {
  canDeleteMedicine,
  selectBatchesForMedicine,
  selectBatchHistory,
  selectMedicineViewById,
  selectTransactionViews,
  useInventory,
  type ID,
  type InventoryState,
} from '@/data';

export function useMedicineView(id: ID) {
  return useInventory(
    useCallback(
      (state: InventoryState, today: Date) => selectMedicineViewById(state, today, id),
      [id],
    ),
  );
}

export function useCanDeleteMedicine(id: ID) {
  return useInventory(useCallback((state: InventoryState) => canDeleteMedicine(state, id), [id]));
}

export function useMedicineBatches(id: ID) {
  return useInventory(
    useCallback(
      (state: InventoryState, today: Date) => selectBatchesForMedicine(state, today, id),
      [id],
    ),
  );
}

export function useMedicineTransactions(id: ID) {
  const all = useInventory(selectTransactionViews);
  return useMemo(() => all.filter((tx) => tx.medicineId === id), [all, id]);
}

export function useBatchHistory(batchId: ID | undefined) {
  return useInventory(
    useCallback(
      (state: InventoryState) => (batchId ? selectBatchHistory(state, batchId) : []),
      [batchId],
    ),
  );
}

export function useBatchNumber(batchId: ID | undefined) {
  return useInventory(
    useCallback(
      (state: InventoryState) => (batchId ? state.batches[batchId]?.batchNumber : undefined),
      [batchId],
    ),
  );
}
