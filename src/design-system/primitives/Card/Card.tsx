import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/shared/cn';

export interface CardProps extends ComponentProps<'div'> {
  interactive?: boolean;
  padded?: boolean;
}

export function Card({ interactive, padded = true, className, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn('card', padded && 'p-6 max-md:p-4', interactive && 'lift', className)}
    />
  );
}

interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function CardHeader({ title, description, actions, className }: CardHeaderProps) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <h3 className="text-fg text-base font-semibold">{title}</h3>
        {description && <p className="text-fg-muted mt-1 text-sm">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
