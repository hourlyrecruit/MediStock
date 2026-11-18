import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns';
import type { Batch, ExpiryStatus } from '@/data/types';

export function daysUntilExpiry(batch: Pick<Batch, 'expiryDate'>, today: Date) {
  return differenceInCalendarDays(parseISO(batch.expiryDate), startOfDay(today));
}

export function expiryStatus(daysLeft: number, alertDays: number): ExpiryStatus {
  if (daysLeft < 0) return 'EXPIRED';
  if (daysLeft === 0) return 'EXPIRES_TODAY';
  if (daysLeft <= alertDays) return 'EXPIRING_SOON';
  return 'VALID';
}

export function isUsable(status: ExpiryStatus) {
  return status !== 'EXPIRED';
}
