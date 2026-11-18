import type { TargetAndTransition } from 'framer-motion';
import { durations, easings } from '../../motion/tokens';

export const floatingMotion: Record<'initial' | 'animate' | 'exit', TargetAndTransition> = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: durations.micro, ease: easings.out } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.1, ease: easings.out } },
};

export const floatingSurface = 'glass z-50 rounded-lg border p-1.5 shadow-raised outline-none';
