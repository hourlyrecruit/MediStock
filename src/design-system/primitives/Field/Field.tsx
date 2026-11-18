import { useId, useMemo, type ReactNode } from 'react';
import { m } from 'framer-motion';
import { cn } from '@/shared/cn';
import { durations } from '../../motion/tokens';
import { FieldContext } from './context';

export interface FieldProps {
  label: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  optional?: boolean;
  id?: string;
  labelAction?: ReactNode;
  className?: string;
}

export function Field({
  label,
  children,
  hint,
  error,
  required = false,
  optional,
  id,
  labelAction,
  className,
}: FieldProps) {
  const autoId = useId();
  const controlId = id ?? `field-${autoId}`;
  const hintId = `${controlId}-hint`;
  const errorId = `${controlId}-error`;
  const invalid = Boolean(error);
  const describedBy = invalid ? errorId : hint ? hintId : undefined;

  const value = useMemo(
    () => ({ id: controlId, describedBy, invalid, required }),
    [controlId, describedBy, invalid, required],
  );

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={controlId} className="text-fg text-sm font-medium">
          {label}
          {required && (
            <span aria-hidden className="text-danger ml-0.5">
              *
            </span>
          )}
          {optional && <span className="text-fg-faint ml-1 font-normal">(optional)</span>}
        </label>
        {labelAction}
      </div>
      <FieldContext.Provider value={value}>{children}</FieldContext.Provider>
      <div className="min-h-4 text-xs">
        {invalid ? (
          <m.p
            key={error}
            id={errorId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: durations.micro }}
            className="text-danger"
          >
            {error}
          </m.p>
        ) : hint ? (
          <p id={hintId} className="text-fg-muted">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
