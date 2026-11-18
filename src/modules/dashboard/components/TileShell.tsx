import { useId, type ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { buttonBase, buttonVariants } from '@/design-system';
import { cn } from '@/shared/cn';

interface TileShellProps {
  title: string;
  description?: ReactNode;
  viewAllHref?: string;
  viewAllLabel?: string;
  children: (headingId: string) => ReactNode;
  className?: string;
}

export function TileShell({
  title,
  description,
  viewAllHref,
  viewAllLabel,
  children,
  className,
}: TileShellProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={cn('card flex h-full flex-col p-6 max-md:p-4', className)}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id={headingId} className="text-fg text-base font-semibold">
            {title}
          </h2>
          {description && <p className="text-fg-muted mt-1 text-sm">{description}</p>}
        </div>
        {viewAllHref && (
          <Link
            to={viewAllHref}
            aria-label={viewAllLabel}
            className={cn(
              buttonBase,
              buttonVariants.ghost,
              '-mt-1 -mr-2 h-9 px-3 text-sm active:scale-[0.97] pointer-coarse:h-11',
            )}
          >
            View all
            <ArrowRight aria-hidden className="nudge size-4" />
          </Link>
        )}
      </div>
      {children(headingId)}
    </section>
  );
}
