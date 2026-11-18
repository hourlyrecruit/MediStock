import { AlarmClock, Clock, ShieldCheck, XCircle, type LucideIcon } from 'lucide-react';
import type { ExpiryStatus } from '@/data/types';
import type { Tone } from '../internal/tones';
import { Badge } from './Badge';

const config: Record<ExpiryStatus, { tone: Tone; icon: LucideIcon; label: string }> = {
  VALID: { tone: 'success', icon: ShieldCheck, label: 'Valid' },
  EXPIRING_SOON: { tone: 'warning', icon: Clock, label: 'Expiring soon' },
  EXPIRES_TODAY: { tone: 'urgent', icon: AlarmClock, label: 'Expires today' },
  EXPIRED: { tone: 'danger', icon: XCircle, label: 'Expired' },
};

const days = (count: number) => `${count} ${count === 1 ? 'day' : 'days'}`;

export function expiryBadgeLabel(status: ExpiryStatus, daysLeft?: number) {
  const { label } = config[status];
  if (daysLeft === undefined || status === 'EXPIRES_TODAY') return label;
  if (status === 'EXPIRED') return `${label} · ${days(Math.abs(daysLeft))} ago`;
  return `${label} · ${days(daysLeft)}`;
}

interface ExpiryBadgeProps {
  status: ExpiryStatus;
  daysLeft?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function ExpiryBadge({ status, daysLeft, size, className }: ExpiryBadgeProps) {
  const { tone, icon } = config[status];
  return (
    <Badge tone={tone} icon={icon} size={size} pulseKey={status} className={className}>
      {expiryBadgeLabel(status, daysLeft)}
    </Badge>
  );
}
