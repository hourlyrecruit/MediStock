import { format, formatDistanceToNowStrict, parseISO } from 'date-fns';

export const DISPLAY_DATE = 'dd MMM yyyy';
export const DISPLAY_DATETIME = 'dd MMM yyyy, hh:mm a';
export const ISO_DATE = 'yyyy-MM-dd';

export function formatDate(value: string | Date) {
  return format(typeof value === 'string' ? parseISO(value) : value, DISPLAY_DATE);
}

export function formatDateTime(value: string | Date) {
  return format(typeof value === 'string' ? parseISO(value) : value, DISPLAY_DATETIME);
}

export function toISODate(value: Date) {
  return format(value, ISO_DATE);
}

export function formatRelative(value: string) {
  return formatDistanceToNowStrict(parseISO(value), { addSuffix: true });
}

export function formatDaysLeft(daysLeft: number) {
  if (daysLeft === 0) return 'Expires today';
  if (daysLeft < 0) {
    const ago = Math.abs(daysLeft);
    return `Expired ${ago} ${ago === 1 ? 'day' : 'days'} ago`;
  }
  return `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`;
}
