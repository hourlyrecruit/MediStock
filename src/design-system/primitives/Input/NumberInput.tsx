import type { ReactNode } from 'react';
import { cn } from '@/shared/cn';
import { Input, type InputProps } from './Input';

export interface NumberInputProps extends Omit<
  InputProps,
  'type' | 'leading' | 'trailing' | 'prefix'
> {
  prefix?: ReactNode;
  suffix?: ReactNode;
  decimal?: boolean;
}

export function NumberInput({
  prefix,
  suffix,
  decimal = false,
  className,
  step,
  ...props
}: NumberInputProps) {
  return (
    <Input
      {...props}
      type="number"
      inputMode={decimal ? 'decimal' : 'numeric'}
      step={step ?? (decimal ? 'any' : 1)}
      leading={prefix ? <span className="text-fg-muted text-sm">{prefix}</span> : undefined}
      trailing={suffix ? <span className="text-fg-muted pr-1 text-sm">{suffix}</span> : undefined}
      className={cn(
        'tabular [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
        className,
      )}
    />
  );
}
