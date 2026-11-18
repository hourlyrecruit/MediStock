import { useRef, type ReactNode } from 'react';
import { useInView } from 'framer-motion';

interface InViewProps {
  children: ReactNode;
  fallback?: ReactNode;
  amount?: number;
  className?: string;
}

export function InView({ children, fallback = null, amount = 0.3, className }: InViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });
  return (
    <div ref={ref} className={className}>
      {inView ? children : fallback}
    </div>
  );
}
