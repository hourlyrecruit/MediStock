import type { ComponentProps } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/cn';
import { useFieldControl } from '../Field/context';
import { controlBase, controlHeight } from '../Input/styles';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends ComponentProps<'select'> {
  options?: readonly SelectOption[];
  placeholder?: string;
  invalid?: boolean;
  wrapperClassName?: string;
}

export function Select({
  options,
  placeholder,
  invalid,
  className,
  wrapperClassName,
  children,
  ...props
}: SelectProps) {
  const a11y = useFieldControl(props, invalid);
  return (
    <div className={cn('relative w-full', wrapperClassName)}>
      <select
        {...props}
        {...a11y}
        className={cn(
          controlBase,
          controlHeight,
          'cursor-pointer appearance-none pr-9 pl-3',
          className,
        )}
      >
        {placeholder !== undefined && (
          <option value="" disabled={props.required}>
            {placeholder}
          </option>
        )}
        {options?.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="text-fg-faint pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
      />
    </div>
  );
}
