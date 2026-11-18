import type { Transition } from 'framer-motion';

export const springs = {
  snappy: { type: 'spring', stiffness: 420, damping: 32 },
  smooth: { type: 'spring', stiffness: 260, damping: 28 },
  gentle: { type: 'spring', stiffness: 140, damping: 20 },
} satisfies Record<string, Transition>;

export const durations = { micro: 0.15, ui: 0.26, page: 0.4, pageExit: 0.18 } as const;

export const easings = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const satisfies Record<string, [number, number, number, number]>;

export const stagger = { cards: 0.04, rows: 0.02 } as const;
