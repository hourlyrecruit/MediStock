import { addDays, differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns';

const DATE_FIELDS: Record<string, readonly string[]> = {
  '/medicines': ['createdAt', 'updatedAt'],
  '/batches': ['expiryDate', 'receivedDate', 'createdAt'],
  '/transactions': ['date'],
};

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function shift(value: unknown, days: number) {
  if (typeof value !== 'string') return value;
  const shifted = addDays(parseISO(value), days);
  return DATE_ONLY.test(value) ? format(shifted, 'yyyy-MM-dd') : shifted.toISOString();
}

export function offsetDays(referenceDate: string, today: Date) {
  return differenceInCalendarDays(startOfDay(today), parseISO(referenceDate));
}

export function rebasePayload(path: string, payload: unknown, days: number): unknown {
  const fields = DATE_FIELDS[path];
  if (!fields || days === 0) return payload;
  if (typeof payload !== 'object' || payload === null || !('data' in payload)) return payload;
  const { data } = payload;
  if (!Array.isArray(data)) return payload;
  return {
    ...payload,
    data: data.map((item: unknown) => {
      if (typeof item !== 'object' || item === null) return item;
      const next: Record<string, unknown> = { ...item };
      for (const field of fields) {
        if (field in next) next[field] = shift(next[field], days);
      }
      return next;
    }),
  };
}
