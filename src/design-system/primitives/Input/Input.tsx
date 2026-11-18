import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/shared/cn';
import { useFieldControl } from '../Field/context';
import { controlBase, controlHeight } from './styles';

export interface InputProps extends ComponentProps<'input'> {
  invalid?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  wrapperClassName?: string;
}

export function Input({
  invalid,
  leading,
  trailing,
  className,
  wrapperClassName,
  ...props
}: InputProps) {
  const a11y = useFieldControl(props, invalid);
  const input = (
    <input
      {...props}
      {...a11y}
      className={cn(
        controlBase,
        controlHeight,
        leading ? 'pl-9' : 'pl-3',
        trailing ? 'pr-10' : 'pr-3',
        className,
      )}
    />
  );
  if (!leading && !trailing) return input;
  return (
    <div className={cn('relative w-full', wrapperClassName)}>
      {leading && (
        <span className="text-fg-faint pointer-events-none absolute inset-y-0 left-3 flex items-center">
          {leading}
        </span>
      )}
      {input}
      {trailing && (
        <span className="text-fg-muted absolute inset-y-0 right-2 flex items-center">
          {trailing}
        </span>
      )}
    </div>
  );
}
