import type { ReactNode } from 'react';
import { cn } from '@/shared/cn';

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'border-border-subtle bg-surface text-fg-muted inline-flex h-5 min-w-5 items-center justify-center rounded-[6px] border px-1.5 font-sans text-[11px] font-medium shadow-xs',
        className,
      )}
    >
      {children}
    </kbd>
  );
}
