import { addDays, format } from 'date-fns';
import type { Batch, InventoryState, Medicine, StockTransaction } from '@/data/types';
import referenceData from '@/data/api/mock/reference-data.json';

export const FIXED_TODAY = new Date(2026, 9, 31);
export const FIXED_NOW = new Date(2026, 9, 31, 10, 30);

export function isoIn(days: number, from: Date = FIXED_TODAY) {
  return format(addDays(from, days), 'yyyy-MM-dd');
}

export function makeMedicine(overrides: Partial<Medicine> & { id: string }): Medicine {
  return {
    name: `Medicine ${overrides.id}`,
    genericName: 'Generic',
    category: 'Analgesics',
    manufacturer: 'Test Labs',
    unitPrice: 10,
    minStockLevel: 10,
    description: '',
    isActive: true,
    createdAt: '2025-01-01T09:00:00.000Z',
    updatedAt: '2025-01-01T09:00:00.000Z',
    ...overrides,
  };
}

export function makeBatch(
  overrides: Partial<Batch> & { id: string; medicineId: string; daysLeft?: number },
): Batch {
  const { daysLeft = 100, ...rest } = overrides;
  const quantity = rest.quantity ?? 10;
  return {
    batchNumber: `B-${rest.id}`,
    openingQuantity: quantity,
    quantity,
    expiryDate: isoIn(daysLeft),
    receivedDate: isoIn(-300),
    createdAt: '2025-01-01T09:00:00.000Z',
    ...rest,
  };
}

export function makeState(parts: {
  medicines?: Medicine[];
  batches?: Batch[];
  transactions?: StockTransaction[];
  alertDays?: number;
}): InventoryState {
  return {
    schemaVersion: 2,
    medicines: Object.fromEntries((parts.medicines ?? []).map((m) => [m.id, m])),
    batches: Object.fromEntries((parts.batches ?? []).map((b) => [b.id, b])),
    transactions: parts.transactions ?? [],
    settings: {
      pharmacyName: 'Test Pharmacy',
      currency: 'INR',
      expiryAlertDays: parts.alertDays ?? 30,
    },
    reference: referenceData.data,
    seededOn: isoIn(0),
  };
}
