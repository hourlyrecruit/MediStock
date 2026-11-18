import { useId } from 'react';
import { cn } from '@/shared/cn';

interface StaticAccentFallbackProps {
  className?: string;
}

export function StaticAccentFallback({ className }: StaticAccentFallbackProps) {
  const shine = `${useId()}-shine`;

  return (
    <div aria-hidden="true" className={cn('absolute inset-0 grid place-items-center', className)}>
      <svg viewBox="0 0 200 200" className="h-3/4 w-3/4" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={shine} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g transform="translate(100 100) rotate(-43)">
          <rect x="-78" y="-28" width="156" height="56" rx="28" style={{ fill: 'var(--surface)', stroke: 'var(--border-subtle)' }} />
          <path d="M0 -28h50a28 28 0 0 1 0 56H0z" style={{ fill: 'var(--primary)' }} />
          <rect x="-68" y="-21" width="136" height="16" rx="8" fill={`url(#${shine})`} />
        </g>
      </svg>
    </div>
  );
}
