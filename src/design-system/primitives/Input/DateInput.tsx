import { cn } from '@/shared/cn';
import { Input, type InputProps } from './Input';

export type DateInputProps = Omit<InputProps, 'type' | 'leading' | 'trailing'>;

export function DateInput({ className, ...props }: DateInputProps) {
  return (
    <Input
      {...props}
      type="date"
      className={cn(
        'tabular [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 dark:[&::-webkit-calendar-picker-indicator]:invert',
        className,
      )}
    />
  );
}
