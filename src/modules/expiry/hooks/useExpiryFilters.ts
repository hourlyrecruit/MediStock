import { useCallback } from 'react';
import { z } from 'zod';
import type { MedicineCategory } from '@/data';
import { useUrlState } from '@/shared/hooks';
import type { ExpiryFilter } from '@/shared/routes';

export const EXPIRY_FILTERS = [
  'all',
  'expires-today',
  'expiring-soon',
  'expired',
  'valid',
] as const;

const filtersSchema = z.object({
  status: z.enum(EXPIRY_FILTERS).default('all'),
  category: z.string().min(1).optional(),
  today: z.enum(['include', 'exclude']).default('include'),
  empty: z.enum(['show']).optional(),
});

export interface ExpiryFilters {
  status: ExpiryFilter;
  category: MedicineCategory | undefined;
  includeToday: boolean;
  showEmpty: boolean;
}

export function useExpiryFilters() {
  const [state, setState] = useUrlState(filtersSchema);

  const filters: ExpiryFilters = {
    status: state.status,
    category: state.category,
    includeToday: state.today === 'include',
    showEmpty: state.empty === 'show',
  };

  const setStatus = useCallback(
    (status: ExpiryFilter) => setState({ status: status === 'all' ? undefined : status }),
    [setState],
  );
  const setCategory = useCallback(
    (category: MedicineCategory | undefined) => setState({ category }),
    [setState],
  );
  const setIncludeToday = useCallback(
    (include: boolean) => setState({ today: include ? undefined : 'exclude' }),
    [setState],
  );
  const setShowEmpty = useCallback(
    (show: boolean) => setState({ empty: show ? 'show' : undefined }),
    [setState],
  );

  return { filters, setStatus, setCategory, setIncludeToday, setShowEmpty };
}
