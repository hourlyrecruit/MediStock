import type { ReactNode } from 'react';
import { m } from 'framer-motion';
import { cn } from '@/shared/cn';
import { springs } from '../../motion/tokens';

export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
  layoutId?: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  layoutId,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'mb-8 flex flex-col gap-4 max-md:mb-6 md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && <div className="mb-2">{eyebrow}</div>}
        <m.h1
          layoutId={layoutId}
          transition={springs.smooth}
          className="text-fg text-xl font-semibold md:text-2xl"
        >
          {title}
        </m.h1>
        {description && <p className="text-fg-muted mt-1 max-w-2xl text-sm">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
