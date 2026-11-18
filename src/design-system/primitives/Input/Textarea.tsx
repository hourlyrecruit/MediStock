import type { ComponentProps } from 'react';
import { cn } from '@/shared/cn';
import { useFieldControl } from '../Field/context';
import { controlBase } from './styles';

export interface TextareaProps extends ComponentProps<'textarea'> {
  invalid?: boolean;
}

export function Textarea({ invalid, className, rows = 3, ...props }: TextareaProps) {
  const a11y = useFieldControl(props, invalid);
  return (
    <textarea
      {...props}
      {...a11y}
      rows={rows}
      className={cn(controlBase, 'min-h-20 resize-y px-3 py-2 leading-6', className)}
    />
  );
}
