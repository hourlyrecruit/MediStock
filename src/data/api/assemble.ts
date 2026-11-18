import { format, startOfDay } from 'date-fns';
import type {
  Batch,
  InventoryState,
  Medicine,
  ReferenceData,
  Settings,
  StockTransaction,
} from '@/data/types';
import { assertInvariants } from '@/data/services/invariants';
import { parseInventoryState } from '@/data/store/schema';
import { ApiError } from './errors';

export interface InventoryParts {
  medicines: Medicine[];
  batches: Batch[];
  transactions: StockTransaction[];
  settings: Settings;
  reference: ReferenceData;
}

function byId<T extends { id: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

export function assembleInventory(parts: InventoryParts, today: Date): InventoryState {
  const state = parseInventoryState({
    schemaVersion: 2,
    medicines: byId(parts.medicines),
    batches: byId(parts.batches),
    transactions: [...parts.transactions].sort((a, b) => a.date.localeCompare(b.date)),
    settings: parts.settings,
    reference: parts.reference,
    seededOn: format(startOfDay(today), 'yyyy-MM-dd'),
  });
  if (!state)
    throw new ApiError(502, 'Inventory data from the server is malformed', 'INVALID_RESPONSE');
  try {
    assertInvariants(state);
  } catch (error) {
    throw new ApiError(
      502,
      error instanceof Error ? error.message : 'Inventory data is inconsistent',
      'INVALID_RESPONSE',
    );
  }
  return state;
}
