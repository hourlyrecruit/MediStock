import { useEffect, useLayoutEffect, useRef } from 'react';
import { animate } from 'framer-motion';
import { useReducedMotion } from '@/shared/hooks/useMotion';
import { cn } from '@/shared/cn';
import { formatNumber } from '@/shared/format';
import { easings } from './tokens';

interface CountUpProps {
  value: number;
  from?: number;
  duration?: number;
  format?: (value: number) => string;
  className?: string;
}

const defaultFormat = (value: number) => formatNumber(Math.round(value));

export function CountUp({
  value,
  from = 0,
  duration = 0.6,
  format = defaultFormat,
  className,
}: CountUpProps) {
  const reduce = useReducedMotion();
  const nodeRef = useRef<HTMLSpanElement>(null);
  const currentRef = useRef(reduce ? value : from);
  const formatRef = useRef(format);

  useLayoutEffect(() => {
    formatRef.current = format;
  });

  useLayoutEffect(() => {
    const node = nodeRef.current;
    if (node && !node.textContent) node.textContent = formatRef.current(currentRef.current);
  }, []);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    if (reduce || currentRef.current === value) {
      currentRef.current = value;
      node.textContent = formatRef.current(value);
      return;
    }
    const controls = animate(currentRef.current, value, {
      duration,
      ease: easings.out,
      onUpdate: (latest) => {
        currentRef.current = latest;
        node.textContent = formatRef.current(latest);
      },
      onComplete: () => {
        currentRef.current = value;
        node.textContent = formatRef.current(value);
      },
    });
    return () => controls.stop();
  }, [value, reduce, duration]);

  return (
    <span className={cn('tabular', className)}>
      <span ref={nodeRef} aria-hidden />
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}
