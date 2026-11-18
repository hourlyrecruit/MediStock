import { z } from 'zod';

export const MEDICINE_STATUS_FILTERS = ['all', 'active', 'inactive'] as const;
export type MedicineStatusFilter = (typeof MEDICINE_STATUS_FILTERS)[number];

export const medicineFiltersSchema = z.object({
  category: z.string().min(1).optional(),
  status: z.enum(MEDICINE_STATUS_FILTERS).default('all'),
});

export type MedicineFilters = z.infer<typeof medicineFiltersSchema>;

export const MEDICINE_TABS = ['batches', 'transactions'] as const;
export type MedicineTab = (typeof MEDICINE_TABS)[number];

export const medicineTabSchema = z.object({
  tab: z.enum(MEDICINE_TABS).default('batches'),
});
