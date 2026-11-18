import { CountUp } from '@/design-system';
import { cn } from '@/shared/cn';
import type { ExpiryFilter } from '@/shared/routes';
import type { ExpiryCounts } from '../hooks/useExpiryData';
import { STATUS_META, STATUS_ORDER } from './statusMeta';

interface ExpirySummaryProps {
  counts: ExpiryCounts;
  active: ExpiryFilter;
  onSelect: (filter: ExpiryFilter) => void;
}

export function ExpirySummary({ counts, active, onSelect }: ExpirySummaryProps) {
  return (
    <div
      role="group"
      aria-label="Batch expiry summary"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {STATUS_ORDER.map((filter) => {
        const { label, icon: Icon, iconClass } = STATUS_META[filter];
        const selected = active === filter;
        const count = counts[filter];
        return (
          <button
            key={filter}
            type="button"
            aria-pressed={selected}
            aria-label={`${label}: ${count} ${count === 1 ? 'batch' : 'batches'}`}
            onClick={() => onSelect(selected ? 'all' : filter)}
            className={cn(
              'card focus-ring hover:border-border-strong flex min-h-11 flex-col items-start gap-2 p-4 text-left transition-[border-color,background-color,transform] duration-150 active:scale-[0.97]',
              selected && 'border-primary bg-primary-tint',
            )}
          >
            <span className="text-fg-muted flex w-full items-center justify-between gap-2 text-sm">
              <span className="truncate">{label}</span>
              <Icon aria-hidden className={cn('size-4 shrink-0', iconClass)} strokeWidth={1.75} />
            </span>
            <span className="tabular text-fg text-xl font-semibold">
              <CountUp value={count} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
