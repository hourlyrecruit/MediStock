import type { Variants } from 'framer-motion';
import { easings, springs } from '@/design-system';

export const heroSequence: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
};

export const heroItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { ...springs.smooth, opacity: { duration: 0.5, ease: easings.out } },
  },
};

export const chipSequence: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

export const sceneReveal: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9, ease: easings.out } },
};
