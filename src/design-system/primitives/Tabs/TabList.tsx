import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { m } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/cn';
import { springs } from '../../motion/tokens';

export interface TabOption<V extends string> {
  value: V;
  label: ReactNode;
  icon?: LucideIcon;
  count?: number;
  disabled?: boolean;
}

interface TabListProps<V extends string> {
  options: readonly TabOption<V>[];
  value: V | undefined;
  onChange: (value: V) => void;
  label: string;
  variant: 'segmented' | 'underline';
  size?: 'sm' | 'md';
  idBase?: string;
  fullWidth?: boolean;
  className?: string;
}

export function tabIds(base: string, value: string) {
  return { tab: `${base}-tab-${value}`, panel: `${base}-panel-${value}` };
}

export function TabList<V extends string>({
  options,
  value,
  onChange,
  label,
  variant,
  size = 'md',
  idBase,
  fullWidth,
  className,
}: TabListProps<V>) {
  const pillId = useId();
  const refs = useRef(new Map<V, HTMLButtonElement>());
  const enabled = options.filter((option) => !option.disabled);
  const focusable = enabled.some((option) => option.value === value) ? value : enabled[0]?.value;

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = enabled.findIndex((option) => option.value === value);
    let next: TabOption<V> | undefined;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
      next = enabled[(index + 1) % enabled.length];
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
      next = enabled[(index - 1 + enabled.length) % enabled.length];
    else if (event.key === 'Home') next = enabled[0];
    else if (event.key === 'End') next = enabled[enabled.length - 1];
    if (!next) return;
    event.preventDefault();
    onChange(next.value);
    refs.current.get(next.value)?.focus();
  };

  const segmented = variant === 'segmented';

  return (
    <div
      role="tablist"
      aria-label={label}
      aria-orientation="horizontal"
      className={cn(
        'relative max-w-full flex-wrap',
        segmented
          ? 'border-border-subtle bg-surface-muted inline-flex gap-1 rounded-md border p-1'
          : 'border-border-subtle flex gap-x-6 border-b',
        fullWidth && 'flex w-full',
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        const Icon = option.icon;
        const ids = idBase ? tabIds(idBase, option.value) : undefined;
        return (
          <button
            key={option.value}
            ref={(node) => {
              if (node) refs.current.set(option.value, node);
              else refs.current.delete(option.value);
            }}
            type="button"
            role="tab"
            id={ids?.tab}
            aria-controls={ids?.panel}
            aria-selected={selected}
            tabIndex={option.value === focusable ? 0 : -1}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              'focus-ring relative inline-flex shrink-0 items-center justify-center gap-2 font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50',
              fullWidth && 'flex-1',
              segmented
                ? cn(
                    'rounded-sm px-3',
                    size === 'sm' ? 'h-7 text-xs' : 'h-8 text-sm',
                    'pointer-coarse:h-10',
                  )
                : 'h-11 px-0.5 text-sm',
              selected ? 'text-fg' : 'text-fg-muted hover:text-fg',
            )}
          >
            {selected && (
              <m.span
                layoutId={`tab-indicator-${pillId}`}
                transition={springs.snappy}
                aria-hidden
                className={
                  segmented
                    ? 'border-border-subtle bg-surface absolute inset-0 rounded-sm border shadow-xs'
                    : 'bg-primary absolute inset-x-0 -bottom-px h-0.5 rounded-full'
                }
              />
            )}
            {Icon && <Icon aria-hidden className="relative size-4" strokeWidth={1.75} />}
            <span className="relative">{option.label}</span>
            {option.count !== undefined && (
              <span className="tabular bg-surface-muted text-fg-muted relative rounded-full px-1.5 text-xs">
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
