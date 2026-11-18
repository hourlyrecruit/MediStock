import type {
  BatchHistoryRow,
  BatchView,
  ExpiryStatus,
  ID,
  InventoryState,
  Medicine,
  MedicineView,
  StockSummary,
} from '@/data/types';
import { daysUntilExpiry, expiryStatus, isUsable } from './expiry';
import { memoizeByRef, stateKey } from './memo';

function compareBatchViews(a: BatchView, b: BatchView) {
  return (
    a.expiryDate.localeCompare(b.expiryDate) ||
    a.medicine.name.localeCompare(b.medicine.name) ||
    a.batchNumber.localeCompare(b.batchNumber)
  );
}

export const selectBatchViews = memoizeByRef(
  (state: InventoryState, today: Date): BatchView[] => {
    const alertDays = state.settings.expiryAlertDays;
    const views: BatchView[] = [];
    for (const batch of Object.values(state.batches)) {
      const medicine = state.medicines[batch.medicineId];
      if (!medicine) continue;
      const daysLeft = daysUntilExpiry(batch, today);
      const status = expiryStatus(daysLeft, alertDays);
      views.push({ ...batch, medicine, daysLeft, status, isUsable: isUsable(status) });
    }
    return views.sort(compareBatchViews);
  },
  (state, today) => stateKey(state, today),
);

function emptySummary(): StockSummary {
  return {
    usable: 0,
    expiringToday: 0,
    expiringSoon: 0,
    expired: 0,
    total: 0,
    batchCount: 0,
    nextExpiry: null,
  };
}

export const selectStockByMedicine = memoizeByRef(
  (state: InventoryState, today: Date): Record<ID, StockSummary> => {
    const summaries: Record<ID, StockSummary> = {};
    for (const id of Object.keys(state.medicines)) summaries[id] = emptySummary();
    for (const view of selectBatchViews(state, today)) {
      const summary = summaries[view.medicineId];
      if (!summary) continue;
      summary.batchCount += 1;
      summary.total += view.quantity;
      if (view.status === 'EXPIRED') summary.expired += view.quantity;
      else summary.usable += view.quantity;
      if (view.status === 'EXPIRES_TODAY') summary.expiringToday += view.quantity;
      if (view.status === 'EXPIRING_SOON') summary.expiringSoon += view.quantity;
      if (view.isUsable && view.quantity > 0) {
        if (summary.nextExpiry === null || view.expiryDate < summary.nextExpiry) {
          summary.nextExpiry = view.expiryDate;
        }
      }
    }
    return summaries;
  },
  (state, today) => stateKey(state, today),
);

export function toMedicineView(medicine: Medicine, stock: StockSummary): MedicineView {
  const isLowStock = medicine.isActive && stock.usable < medicine.minStockLevel;
  return {
    ...medicine,
    stock,
    isLowStock,
    shortfall: isLowStock ? medicine.minStockLevel - stock.usable : 0,
  };
}

export const selectMedicineViews = memoizeByRef(
  (state: InventoryState, today: Date): MedicineView[] => {
    const stock = selectStockByMedicine(state, today);
    return Object.values(state.medicines)
      .map((medicine) => toMedicineView(medicine, stock[medicine.id] ?? emptySummary()))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
  (state, today) => stateKey(state, today),
);

export const selectLowStock = memoizeByRef(
  (state: InventoryState, today: Date): MedicineView[] =>
    selectMedicineViews(state, today)
      .filter((view) => view.isLowStock)
      .sort((a, b) => b.shortfall - a.shortfall || a.name.localeCompare(b.name)),
  (state, today) => stateKey(state, today),
);

function byStatus(statuses: readonly ExpiryStatus[]) {
  return (state: InventoryState, today: Date) =>
    selectBatchViews(state, today).filter(
      (view) => view.quantity > 0 && statuses.includes(view.status),
    );
}

export const selectExpiresToday = memoizeByRef(byStatus(['EXPIRES_TODAY']), (state, today) =>
  stateKey(state, today),
);

export const selectExpired = memoizeByRef(byStatus(['EXPIRED']), (state, today) =>
  stateKey(state, today),
);

const expiringSoonOnly = memoizeByRef(byStatus(['EXPIRING_SOON']), (state, today) =>
  stateKey(state, today),
);

const expiringSoonWithToday = memoizeByRef(
  byStatus(['EXPIRES_TODAY', 'EXPIRING_SOON']),
  (state, today) => stateKey(state, today),
);

export function selectExpiringSoon(
  state: InventoryState,
  today: Date,
  options: { includeToday?: boolean } = {},
): BatchView[] {
  return options.includeToday
    ? expiringSoonWithToday(state, today)
    : expiringSoonOnly(state, today);
}

export const selectBatchHistory = memoizeByRef(
  (state: InventoryState, batchId: ID): BatchHistoryRow[] => {
    const batch = state.batches[batchId];
    if (!batch) return [];
    const rows: BatchHistoryRow[] = [];
    let running = batch.openingQuantity;
    if (batch.openingQuantity > 0) {
      rows.push({
        id: `opening-${batch.id}`,
        kind: 'OPENING',
        date: batch.createdAt,
        quantityChange: batch.openingQuantity,
        quantityAfter: running,
      });
    }
    for (const tx of state.transactions) {
      if (tx.batchId !== batchId) continue;
      running += tx.quantityChange;
      rows.push({
        id: tx.id,
        kind: tx.type,
        date: tx.date,
        quantityChange: tx.quantityChange,
        quantityAfter: running,
        ...(tx.reason ? { reason: tx.reason } : {}),
        ...(tx.remarks ? { remarks: tx.remarks } : {}),
      });
    }
    return rows;
  },
  (state, batchId) => [state.batches, state.transactions, batchId],
);

export function canDeleteMedicine(state: InventoryState, id: ID) {
  if (!state.medicines[id]) return false;
  const hasBatch = Object.values(state.batches).some((batch) => batch.medicineId === id);
  const hasTx = state.transactions.some((tx) => tx.medicineId === id);
  return !hasBatch && !hasTx;
}

export function selectMedicineById(state: InventoryState, id: ID): Medicine | undefined {
  return state.medicines[id];
}

export const selectBatchesForMedicine = memoizeByRef(
  (state: InventoryState, today: Date, medicineId: ID): BatchView[] =>
    selectBatchViews(state, today).filter((view) => view.medicineId === medicineId),
  (state, today, medicineId) => [...stateKey(state, today), medicineId],
  16,
);

export function selectMedicineViewById(
  state: InventoryState,
  today: Date,
  id: ID,
): MedicineView | undefined {
  return selectMedicineViews(state, today).find((view) => view.id === id);
}
