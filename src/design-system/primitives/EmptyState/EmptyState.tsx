import type { ReactNode } from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/cn';

export interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-16 text-center', className)}>
      <div className="border-border-subtle bg-bg-subtle text-fg-muted mb-4 grid size-12 place-items-center rounded-md border">
        <Icon aria-hidden className="size-5" strokeWidth={1.75} />
      </div>
      <h3 className="text-fg text-base font-semibold">{title}</h3>
      {description && <p className="text-fg-muted mt-1 max-w-sm text-sm">{description}</p>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
