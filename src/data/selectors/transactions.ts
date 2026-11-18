import type { InventoryState, TransactionView } from '@/data/types';
import { memoizeByRef } from './memo';

export const selectTransactionViews = memoizeByRef(
  (state: InventoryState): TransactionView[] =>
    state.transactions
      .map((tx, index) => ({
        index,
        view: {
          ...tx,
          medicineName: state.medicines[tx.medicineId]?.name ?? 'Unknown medicine',
          batchNumber: state.batches[tx.batchId]?.batchNumber ?? 'Unknown batch',
        },
      }))
      .sort((a, b) => b.view.date.localeCompare(a.view.date) || b.index - a.index)
      .map(({ view }) => view),
  (state) => [state.medicines, state.batches, state.transactions],
);
