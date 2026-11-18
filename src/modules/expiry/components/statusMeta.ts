import { AlarmClock, Clock, ShieldCheck, XCircle, type LucideIcon } from 'lucide-react';
import type { ExpiryFilter } from '@/shared/routes';

export type StatusFilter = Exclude<ExpiryFilter, 'all'>;

export const STATUS_META: Record<
  StatusFilter,
  { label: string; icon: LucideIcon; iconClass: string }
> = {
  'expires-today': { label: 'Expires today', icon: AlarmClock, iconClass: 'text-urgent' },
  'expiring-soon': { label: 'Expiring soon', icon: Clock, iconClass: 'text-warning' },
  expired: { label: 'Expired', icon: XCircle, iconClass: 'text-danger' },
  valid: { label: 'Valid', icon: ShieldCheck, iconClass: 'text-success' },
};

export const STATUS_ORDER: readonly StatusFilter[] = [
  'expires-today',
  'expiring-soon',
  'expired',
  'valid',
];
