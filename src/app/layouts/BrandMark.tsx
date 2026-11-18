import { Link } from 'react-router';
import { cn } from '@/shared/cn';

export function BrandMark({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      to="/welcome"
      aria-label="MediStock home"
      className={cn('flex items-center gap-3 rounded-md', className)}
    >
      <span className="bg-primary grid size-10 shrink-0 place-items-center rounded-[12px]">
        <svg viewBox="0 0 24 24" aria-hidden className="fill-primary-fg size-5">
          <path d="M9.5 3h5v6.5H21v5h-6.5V21h-5v-6.5H3v-5h6.5z" />
        </svg>
      </span>
      {!compact && <span className="text-lg font-semibold tracking-tight">MediStock</span>}
    </Link>
  );
}
