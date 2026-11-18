import type { ReactNode } from 'react';
import { m } from 'framer-motion';
import { Link } from 'react-router';
import { ArrowDownRight, ArrowRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/cn';
import { formatSigned } from '@/shared/format';
import { CountUp } from '../../motion/CountUp';
import { Tilt } from '../../motion/Tilt';
import { springs } from '../../motion/tokens';
import { textTone, type Tone } from '../internal/tones';

export interface StatDelta {
  value: number;
  label?: string;
  goodWhen?: 'up' | 'down';
}

export interface StatCardProps {
  label: string;
  value: number;
  format?: (value: number) => string;
  icon?: LucideIcon;
  tone?: Tone;
  subLabel?: ReactNode;
  delta?: StatDelta;
  href?: string;
  layoutId?: string;
  tilt?: boolean;
  className?: string;
}

function Delta({ value, label, goodWhen = 'up' }: StatDelta) {
  const Icon = value > 0 ? ArrowUpRight : value < 0 ? ArrowDownRight : ArrowRight;
  const good = value === 0 ? null : value > 0 === (goodWhen === 'up');
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <span
        className={cn(
          'tabular inline-flex items-center gap-0.5 font-medium',
          good === null ? 'text-fg-muted' : good ? 'text-success' : 'text-danger',
        )}
      >
        <Icon aria-hidden className="size-3.5" />
        {formatSigned(value)}
      </span>
      {label && <span className="text-fg-muted">{label}</span>}
    </span>
  );
}

export function StatCard({
  label,
  value,
  format,
  icon: Icon,
  tone = 'neutral',
  subLabel,
  delta,
  href,
  layoutId,
  tilt = true,
  className,
}: StatCardProps) {
  const body = (
    <div className="flex h-full min-w-0 flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-fg-muted text-sm font-medium">{label}</p>
        {Icon && (
          <span className="border-border-subtle bg-bg-subtle grid size-9 shrink-0 place-items-center rounded-md border">
            <Icon aria-hidden className={cn('size-4', textTone[tone])} strokeWidth={1.75} />
          </span>
        )}
      </div>
      <p className="text-fg text-xl font-semibold break-words sm:text-2xl">
        <CountUp value={value} format={format} />
      </p>
      {(delta || subLabel) && (
        <div className="text-fg-muted mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {delta && <Delta {...delta} />}
          {subLabel && <span>{subLabel}</span>}
        </div>
      )}
    </div>
  );

  const surface = cn(
    'card block h-full overflow-hidden',
    href &&
      'focus-ring transition-colors duration-150 hover:border-border-strong active:scale-[0.99]',
  );

  const content = href ? (
    <Link to={href} className={surface}>
      {body}
    </Link>
  ) : (
    <div className={surface}>{body}</div>
  );

  return (
    <m.div layoutId={layoutId} transition={springs.smooth} className={cn('h-full', className)}>
      {tilt ? <Tilt className="h-full rounded-lg">{content}</Tilt> : content}
    </m.div>
  );
}
