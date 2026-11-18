import { parseISO } from 'date-fns';
import { z } from 'zod';
import { TRANSACTION_TYPES, type TransactionView } from '@/data';
import { toISODate } from '@/shared/format';

const isoDay = z.iso.date();

export const transactionFilterSchema = z.object({
  type: z.enum(TRANSACTION_TYPES).optional(),
  from: isoDay.optional(),
  to: isoDay.optional(),
});

export type TransactionFilters = z.infer<typeof transactionFilterSchema>;

export function filterTransactions(rows: readonly TransactionView[], filters: TransactionFilters) {
  if (!filters.type && !filters.from && !filters.to) return [...rows];
  return rows.filter((row) => {
    if (filters.type && row.type !== filters.type) return false;
    const day = toISODate(parseISO(row.date));
    if (filters.from && day < filters.from) return false;
    if (filters.to && day > filters.to) return false;
    return true;
  });
}
