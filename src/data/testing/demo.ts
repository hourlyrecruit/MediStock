import type { CurrentUser, InventoryState } from '@/data/types';
import { assembleInventory } from '@/data/api/assemble';
import { offsetDays, rebasePayload } from '@/data/api/mock/rebase';
import {
  isArrayOf,
  isBatch,
  isCurrentUser,
  isMedicine,
  isReferenceData,
  isSettings,
  isTransaction,
  type Guard,
} from '@/data/store/schema';
import batches from '@/data/api/mock/batches.json';
import me from '@/data/api/mock/me.json';
import medicines from '@/data/api/mock/medicines.json';
import meta from '@/data/api/mock/meta.json';
import referenceData from '@/data/api/mock/reference-data.json';
import settings from '@/data/api/mock/settings.json';
import transactions from '@/data/api/mock/transactions.json';

function read<T>(path: string, payload: unknown, guard: Guard<T>, days: number): T {
  const rebased = rebasePayload(path, payload, days) as { data: unknown };
  if (!guard(rebased.data)) throw new Error(`Mock fixture ${path} is malformed`);
  return rebased.data;
}

export const DEMO_REFERENCE_DATE = meta.referenceDate;

export function demoInventory(today: Date): InventoryState {
  const days = offsetDays(meta.referenceDate, today);
  return assembleInventory(
    {
      medicines: read('/medicines', medicines, isArrayOf(isMedicine), days),
      batches: read('/batches', batches, isArrayOf(isBatch), days),
      transactions: read('/transactions', transactions, isArrayOf(isTransaction), days),
      settings: read('/settings', settings, isSettings, 0),
      reference: read('/reference-data', referenceData, isReferenceData, 0),
    },
    today,
  );
}

export function demoUser(): CurrentUser {
  return read('/me', me, isCurrentUser, 0);
}

export function demoCategories(): string[] {
  return read('/reference-data', referenceData, isReferenceData, 0).categories.map(
    (category) => category.name,
  );
}
