import { useId, type ReactNode } from 'react';
import { cn } from '@/shared/cn';

export interface SectionProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Section({ title, description, actions, children, className }: SectionProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={title ? headingId : undefined}
      className={cn('flex flex-col gap-4', className)}
    >
      {(title || actions) && (
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            {title && (
              <h2 id={headingId} className="text-fg text-base font-semibold">
                {title}
              </h2>
            )}
            {description && <p className="text-fg-muted mt-0.5 text-sm">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
