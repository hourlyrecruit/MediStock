import { useEffect, useRef, type ReactNode } from 'react';
import { useAnimate } from 'framer-motion';
import { useReducedMotion } from '@/shared/hooks/useMotion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/cn';
import { softTone, solidTone, textTone, type Tone } from '../internal/tones';

export interface BadgeProps {
  tone?: Tone;
  variant?: 'soft' | 'solid' | 'outline';
  icon?: LucideIcon;
  size?: 'sm' | 'md';
  pulseKey?: string | number;
  className?: string;
  title?: string;
  children: ReactNode;
}

export function Badge({
  tone = 'neutral',
  variant = 'soft',
  icon: Icon,
  size = 'md',
  pulseKey,
  className,
  title,
  children,
}: BadgeProps) {
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const reduce = useReducedMotion();
  const previous = useRef(pulseKey);

  useEffect(() => {
    if (previous.current === pulseKey) return;
    previous.current = pulseKey;
    if (reduce || !scope.current) return;
    animate(scope.current, { scale: [1, 1.08, 1] }, { duration: 0.42, ease: 'easeOut' });
    const ring = scope.current.querySelector('[data-pulse-ring]');
    if (ring)
      animate(ring, { opacity: [0.5, 0], scale: [1, 1.35] }, { duration: 0.6, ease: 'easeOut' });
  }, [pulseKey, reduce, animate, scope]);

  return (
    <span
      ref={scope}
      title={title}
      className={cn(
        'relative inline-flex max-w-full shrink-0 items-center gap-1 rounded-sm font-medium whitespace-nowrap',
        size === 'sm' ? 'h-5 px-1.5 text-xs' : 'h-6 px-2 text-xs',
        variant === 'soft' && softTone[tone],
        variant === 'solid' && solidTone[tone],
        variant === 'outline' && cn('border-border-strong border bg-transparent', textTone[tone]),
        className,
      )}
    >
      <span
        data-pulse-ring
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 ring-2 ring-current"
      />
      {Icon && <Icon aria-hidden className="size-3.5 shrink-0" strokeWidth={2} />}
      <span className="truncate">{children}</span>
    </span>
  );
}
