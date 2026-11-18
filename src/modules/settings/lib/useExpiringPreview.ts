import { useCallback } from 'react';
import { selectExpiringSoon, settingsSchema, useInventory, type InventoryState } from '@/data';

const daysSchema = settingsSchema.shape.expiryAlertDays;

export interface ExpiringPreview {
  total: number;
  today: number;
}

export function useExpiringPreview(days: number | undefined): ExpiringPreview | null {
  const valid = daysSchema.safeParse(days);
  const value = valid.success ? valid.data : null;
  const select = useCallback(
    (state: InventoryState, today: Date): ExpiringPreview | null => {
      if (value === null) return null;
      const preview = { ...state, settings: { ...state.settings, expiryAlertDays: value } };
      const batches = selectExpiringSoon(preview, today, { includeToday: true });
      return {
        total: batches.length,
        today: batches.filter((batch) => batch.status === 'EXPIRES_TODAY').length,
      };
    },
    [value],
  );
  return useInventory(select);
}
