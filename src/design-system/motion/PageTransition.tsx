import { useState, type ReactNode } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { useReducedMotion } from '@/shared/hooks/useMotion';
import { useLocation, useOutlet } from 'react-router';
import { durations, easings } from './tokens';

function FrozenOutlet() {
  const outlet = useOutlet();
  const [frozen] = useState(outlet);
  return frozen;
}

export function PageTransition({ children }: { children?: ReactNode }) {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  const key = pathname
    .replace(/\/(new|edit)\/?$/, '')
    .split('/')
    .slice(0, 3)
    .join('/');

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <m.div
        key={key}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.99 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: reduce ? durations.micro : durations.page, ease: easings.out },
        }}
        exit={{ opacity: 0, transition: { duration: durations.pageExit, ease: easings.out } }}
        className="min-w-0"
      >
        {children ?? <FrozenOutlet />}
      </m.div>
    </AnimatePresence>
  );
}
