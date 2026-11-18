import { cn } from '@/shared/cn';

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('skeleton h-4 w-full', className)} />;
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div aria-hidden className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3.5', i === lines - 1 && lines > 1 ? 'w-3/5' : 'w-full')}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('card flex flex-col gap-4 p-6', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="size-9 rounded-md" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function SkeletonTable({
  rows = 6,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div aria-hidden className={cn('flex flex-col', className)}>
      {Array.from({ length: rows }, (_, row) => (
        <div
          key={row}
          className="border-border-subtle flex h-14 items-center gap-6 border-b px-4 last:border-b-0"
        >
          {Array.from({ length: columns }, (_, col) => (
            <Skeleton key={col} className={cn('h-3.5', col === 0 ? 'w-2/5' : 'w-1/5')} />
          ))}
        </div>
      ))}
    </div>
  );
}
