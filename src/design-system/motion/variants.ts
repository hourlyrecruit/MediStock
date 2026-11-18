import type { Variants } from 'framer-motion';
import { durations, easings, springs, stagger } from './tokens';

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: springs.smooth },
  exit: { opacity: 0, transition: { duration: durations.micro, ease: easings.out } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: springs.snappy },
  exit: { opacity: 0, scale: 0.96, transition: { duration: durations.micro, ease: easings.out } },
};

export const listItem: Variants = {
  hidden: { opacity: 0, y: 4 },
  show: { opacity: 1, y: 0, transition: { duration: durations.ui, ease: easings.out } },
};

export const overlay: Variants = {
  hidden: { opacity: 0, backdropFilter: 'blur(0px)' },
  show: {
    opacity: 1,
    backdropFilter: 'blur(8px)',
    transition: { duration: 0.2, ease: easings.out },
  },
  exit: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    transition: { duration: 0.14, ease: easings.out },
  },
};

export function staggerContainer(gap: number = stagger.cards, delayChildren = 0): Variants {
  return {
    hidden: {},
    show: { transition: { staggerChildren: gap, delayChildren } },
  };
}
