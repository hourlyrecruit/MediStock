import { z } from 'zod';
import { EXPIRY_STATUSES, type BatchView, type ExpiryStatus } from '@/data';
import { STATUS_PARAM } from '@/shared/routes';

export const STATUS_FILTERS = ['valid', 'expiring-soon', 'expires-today', 'expired'] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

export const stockFilterSchema = z.object({
  medicine: z.string().optional(),
  status: z.enum(STATUS_FILTERS).optional(),
  empty: z.literal('show').optional(),
});

export type StockFilters = z.infer<typeof stockFilterSchema>;

const STATUS_BY_PARAM = Object.fromEntries(
  EXPIRY_STATUSES.map((status) => [STATUS_PARAM[status], status]),
) as Record<StatusFilter, ExpiryStatus>;

export function filterBatches(batches: readonly BatchView[], filters: StockFilters) {
  const status = filters.status ? STATUS_BY_PARAM[filters.status] : undefined;
  return batches.filter(
    (view) =>
      (filters.empty === 'show' || view.quantity > 0) &&
      (!filters.medicine || view.medicineId === filters.medicine) &&
      (!status || view.status === status),
  );
}
