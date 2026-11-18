import { useMemo } from 'react';
import {
  selectBatchViews,
  selectExpired,
  selectExpiresToday,
  selectExpiringSoon,
  useInventory,
  type BatchView,
  type ExpiryStatus,
  type InventoryState,
} from '@/data';
import type { ExpiryFilter } from '@/shared/routes';
import type { ExpiryFilters } from './useExpiryFilters';

function selectExpiryData(state: InventoryState, today: Date) {
  const all = selectBatchViews(state, today);
  const inStock = all.filter((view) => view.quantity > 0);
  return {
    all,
    inStock,
    expiresToday: selectExpiresToday(state, today),
    expiringSoon: selectExpiringSoon(state, today),
    expired: selectExpired(state, today),
    valid: inStock.filter((view) => view.status === 'VALID'),
    alertDays: state.settings.expiryAlertDays,
  };
}

export type ExpiryCounts = Record<Exclude<ExpiryFilter, 'all'>, number> & { all: number };

function statusesFor(filter: ExpiryFilter, includeToday: boolean): readonly ExpiryStatus[] | null {
  switch (filter) {
    case 'all':
      return null;
    case 'expires-today':
      return ['EXPIRES_TODAY'];
    case 'expiring-soon':
      return includeToday ? ['EXPIRING_SOON', 'EXPIRES_TODAY'] : ['EXPIRING_SOON'];
    case 'expired':
      return ['EXPIRED'];
    case 'valid':
      return ['VALID'];
  }
}

export function useExpiryData(filters: ExpiryFilters) {
  const data = useInventory(selectExpiryData);

  const counts: ExpiryCounts = useMemo(
    () => ({
      all: data.inStock.length,
      'expires-today': data.expiresToday.length,
      'expiring-soon': data.expiringSoon.length,
      expired: data.expired.length,
      valid: data.valid.length,
    }),
    [data],
  );

  const rows: BatchView[] = useMemo(() => {
    const statuses = statusesFor(filters.status, filters.includeToday);
    const source = filters.showEmpty ? data.all : data.inStock;
    return source.filter(
      (view) =>
        (statuses === null || statuses.includes(view.status)) &&
        (filters.category === undefined || view.medicine.category === filters.category),
    );
  }, [data, filters.status, filters.includeToday, filters.showEmpty, filters.category]);

  return { rows, counts, alertDays: data.alertDays };
}
