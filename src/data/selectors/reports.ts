import { format, parseISO } from 'date-fns';
import type { BatchView, InventoryState, ReportId } from '@/data/types';
import {
  ADJUSTMENT_REASON_LABEL,
  EXPIRY_STATUS_LABEL,
  TRANSACTION_TYPE_LABEL,
} from '@/shared/labels';
import { memoizeByRef, stateKey } from './memo';
import { selectExpired, selectExpiringSoon, selectLowStock, selectMedicineViews } from './stock';
import { selectTransactionViews } from './transactions';

export interface ReportColumn {
  key: string;
  header: string;
}

export type ReportCell = string | number;
export type ReportRow = Record<string, ReportCell>;

export interface ReportTable {
  columns: ReportColumn[];
  rows: ReportRow[];
}

function displayDate(value: string) {
  return format(parseISO(value), 'dd MMM yyyy');
}

function money(value: number) {
  return Math.round(value * 100) / 100;
}

const batchColumns: ReportColumn[] = [
  { key: 'medicine', header: 'Medicine' },
  { key: 'batchNumber', header: 'Batch' },
  { key: 'expiryDate', header: 'Expiry date' },
  { key: 'daysLeft', header: 'Days left' },
  { key: 'status', header: 'Status' },
  { key: 'quantity', header: 'Quantity' },
  { key: 'value', header: 'Value (INR)' },
];

function batchRow(view: BatchView): ReportRow {
  return {
    medicine: view.medicine.name,
    batchNumber: view.batchNumber,
    expiryDate: displayDate(view.expiryDate),
    daysLeft: view.daysLeft,
    status: EXPIRY_STATUS_LABEL[view.status],
    quantity: view.quantity,
    value: money(view.quantity * view.medicine.unitPrice),
  };
}

function buildReport(state: InventoryState, today: Date, reportId: ReportId): ReportTable {
  switch (reportId) {
    case 'catalogue':
      return {
        columns: [
          { key: 'name', header: 'Medicine' },
          { key: 'genericName', header: 'Generic name' },
          { key: 'category', header: 'Category' },
          { key: 'manufacturer', header: 'Manufacturer' },
          { key: 'unitPrice', header: 'Unit price (INR)' },
          { key: 'minStockLevel', header: 'Min stock' },
          { key: 'usable', header: 'Usable stock' },
          { key: 'status', header: 'Status' },
        ],
        rows: selectMedicineViews(state, today).map((view) => ({
          name: view.name,
          genericName: view.genericName,
          category: view.category,
          manufacturer: view.manufacturer,
          unitPrice: view.unitPrice,
          minStockLevel: view.minStockLevel,
          usable: view.stock.usable,
          status: view.isActive ? 'Active' : 'Inactive',
        })),
      };
    case 'usable-stock':
      return {
        columns: [
          { key: 'name', header: 'Medicine' },
          { key: 'category', header: 'Category' },
          { key: 'usable', header: 'Usable stock' },
          { key: 'unitPrice', header: 'Unit price (INR)' },
          { key: 'value', header: 'Value (INR)' },
          { key: 'nextExpiry', header: 'Next expiry' },
        ],
        rows: selectMedicineViews(state, today)
          .filter((view) => view.stock.usable > 0)
          .map((view) => ({
            name: view.name,
            category: view.category,
            usable: view.stock.usable,
            unitPrice: view.unitPrice,
            value: money(view.stock.usable * view.unitPrice),
            nextExpiry: view.stock.nextExpiry ? displayDate(view.stock.nextExpiry) : '',
          })),
      };
    case 'low-stock':
      return {
        columns: [
          { key: 'name', header: 'Medicine' },
          { key: 'category', header: 'Category' },
          { key: 'usable', header: 'Usable stock' },
          { key: 'minStockLevel', header: 'Min stock' },
          { key: 'shortfall', header: 'Shortfall' },
        ],
        rows: selectLowStock(state, today).map((view) => ({
          name: view.name,
          category: view.category,
          usable: view.stock.usable,
          minStockLevel: view.minStockLevel,
          shortfall: view.shortfall,
        })),
      };
    case 'expiring-soon':
      return {
        columns: batchColumns,
        rows: selectExpiringSoon(state, today, { includeToday: true }).map(batchRow),
      };
    case 'expired':
      return { columns: batchColumns, rows: selectExpired(state, today).map(batchRow) };
    case 'transactions':
      return {
        columns: [
          { key: 'date', header: 'Date' },
          { key: 'medicine', header: 'Medicine' },
          { key: 'batchNumber', header: 'Batch' },
          { key: 'type', header: 'Type' },
          { key: 'quantityChange', header: 'Change' },
          { key: 'quantityAfter', header: 'Quantity after' },
          { key: 'reason', header: 'Reason' },
          { key: 'remarks', header: 'Remarks' },
        ],
        rows: selectTransactionViews(state).map((view) => ({
          date: displayDate(view.date),
          medicine: view.medicineName,
          batchNumber: view.batchNumber,
          type: TRANSACTION_TYPE_LABEL[view.type],
          quantityChange: view.quantityChange,
          quantityAfter: view.quantityAfter,
          reason: view.reason ? ADJUSTMENT_REASON_LABEL[view.reason] : '',
          remarks: view.remarks ?? '',
        })),
      };
  }
}

export const selectReportRows = memoizeByRef(
  buildReport,
  (state, today, reportId) => [...stateKey(state, today), reportId],
  12,
);
