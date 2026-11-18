import { m } from 'framer-motion';
import { springs } from '@/design-system';
import { cn } from '@/shared/cn';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}

export function ToggleSwitch({ checked, onChange, label, className }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'focus-ring text-fg-muted hover:bg-surface-muted hover:text-fg inline-flex min-h-9 items-center gap-2 rounded-md px-2 text-sm transition-colors active:scale-[0.97] pointer-coarse:min-h-11',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border p-0.5 transition-colors',
          checked
            ? 'border-primary bg-primary justify-end'
            : 'border-border-strong bg-surface-muted justify-start',
        )}
      >
        <m.span
          layout
          transition={springs.snappy}
          className={cn(
            'size-3.5 rounded-full shadow-xs',
            checked ? 'bg-primary-fg' : 'bg-surface',
          )}
        />
      </span>
      <span>{label}</span>
    </button>
  );
}
