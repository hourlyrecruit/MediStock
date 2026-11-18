import type { ID } from '@/data/types';

const segment = (id: ID) => encodeURIComponent(id);

export const endpoints = {
  me: '/me',
  referenceData: '/reference-data',
  settings: '/settings',
  medicines: '/medicines',
  medicine: (id: ID) => `/medicines/${segment(id)}`,
  batches: '/batches',
  batchReceipts: (batchId: ID) => `/batches/${segment(batchId)}/receipts`,
  batchAdjustments: (batchId: ID) => `/batches/${segment(batchId)}/adjustments`,
  transactions: '/transactions',
  demoReset: '/demo/reset',
} as const;
