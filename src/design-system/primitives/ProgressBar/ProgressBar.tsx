import { m } from 'framer-motion';
import { cn } from '@/shared/cn';
import { springs } from '../../motion/tokens';
import { fillTone, type Tone } from '../internal/tones';

export interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: Tone | 'auto';
  size?: 'sm' | 'md';
  label: string;
  valueText?: string;
  className?: string;
}

export function toneForRatio(ratio: number): Tone {
  if (ratio <= 0) return 'danger';
  if (ratio < 0.34) return 'urgent';
  if (ratio < 0.67) return 'warning';
  return 'success';
}

export function ProgressBar({
  value,
  max = 100,
  tone = 'auto',
  size = 'sm',
  label,
  valueText,
  className,
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 1;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const ratio = clamped / safeMax;
  const resolved = tone === 'auto' ? toneForRatio(ratio) : tone;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={clamped}
      aria-valuetext={valueText}
      className={cn(
        'bg-surface-muted relative w-full overflow-hidden rounded-full',
        size === 'sm' ? 'h-1.5' : 'h-2.5',
        className,
      )}
    >
      <m.div
        initial={false}
        animate={{ width: `${ratio * 100}%` }}
        transition={springs.smooth}
        className={cn('h-full rounded-full', fillTone[resolved])}
      />
    </div>
  );
}
