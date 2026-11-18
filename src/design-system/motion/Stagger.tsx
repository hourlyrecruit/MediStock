import type { ReactNode } from 'react';
import { m } from 'framer-motion';
import { useReducedMotion } from '@/shared/hooks/useMotion';
import { fadeUp, listItem, staggerContainer } from './variants';
import { stagger } from './tokens';

type StaggerKind = keyof typeof stagger;

interface StaggerProps {
  children: ReactNode;
  kind?: StaggerKind;
  className?: string;
  delay?: number;
}

export function Stagger({ children, kind = 'cards', className, delay = 0 }: StaggerProps) {
  const reduce = useReducedMotion();
  return (
    <m.div
      className={className}
      initial="hidden"
      animate="show"
      variants={staggerContainer(reduce ? 0 : stagger[kind], delay)}
    >
      {children}
    </m.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  kind?: StaggerKind;
  className?: string;
}

export function StaggerItem({ children, kind = 'cards', className }: StaggerItemProps) {
  return (
    <m.div className={className} variants={kind === 'rows' ? listItem : fadeUp}>
      {children}
    </m.div>
  );
}
