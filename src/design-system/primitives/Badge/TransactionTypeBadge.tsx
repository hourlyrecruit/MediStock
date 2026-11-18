import { ArrowDownToLine, Minus, PackagePlus, Plus, type LucideIcon } from 'lucide-react';
import type { TransactionType } from '@/data/types';
import { TRANSACTION_TYPE_LABEL } from '@/shared/labels';
import type { Tone } from '../internal/tones';
import { Badge } from './Badge';

const config: Record<TransactionType, { tone: Tone; icon: LucideIcon }> = {
  STOCK_IN: { tone: 'success', icon: ArrowDownToLine },
  ADJUSTMENT_INCREASE: { tone: 'info', icon: Plus },
  ADJUSTMENT_DECREASE: { tone: 'urgent', icon: Minus },
  BATCH_CREATED: { tone: 'primary', icon: PackagePlus },
};

interface TransactionTypeBadgeProps {
  type: TransactionType;
  size?: 'sm' | 'md';
  className?: string;
}

export function TransactionTypeBadge({ type, size, className }: TransactionTypeBadgeProps) {
  const { tone, icon } = config[type];
  return (
    <Badge tone={tone} icon={icon} size={size} className={className}>
      {TRANSACTION_TYPE_LABEL[type]}
    </Badge>
  );
}
