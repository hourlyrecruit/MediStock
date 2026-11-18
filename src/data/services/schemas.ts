import { format, startOfDay } from 'date-fns';
import { z } from 'zod';
import { ADJUSTMENT_REASONS } from '@/data/types';

const MAX_QUANTITY = 100000;

function text(label: string, min: number, max: number) {
  return z
    .string({ error: `${label} is required` })
    .trim()
    .min(min, { error: `${label} must be at least ${min} characters` })
    .max(max, { error: `${label} must be at most ${max} characters` });
}

function quantity(label = 'Quantity') {
  return z
    .number({ error: `${label} must be a number` })
    .int({ error: `${label} must be a whole number` })
    .min(1, { error: `${label} must be at least 1` })
    .max(MAX_QUANTITY, { error: `${label} cannot exceed 100,000` });
}

function isoDate(label: string) {
  return z.iso.date({ error: `${label} must be a valid date` });
}

function optionalRemarks() {
  return z.string().trim().max(200, { error: 'Remarks must be at most 200 characters' }).optional();
}

function hasAtMostTwoDecimals(value: number) {
  return Math.abs(Math.round(value * 100) - value * 100) < 1e-6;
}

export function todayISO(today: Date) {
  return format(startOfDay(today), 'yyyy-MM-dd');
}

export const medicineInputSchema = z.object({
  name: text('Name', 2, 80),
  genericName: text('Generic name', 2, 80),
  category: z.string({ error: 'Select a category' }).trim().min(1, { error: 'Select a category' }),
  manufacturer: text('Manufacturer', 2, 80),
  unitPrice: z
    .number({ error: 'Unit price must be a number' })
    .positive({ error: 'Unit price must be greater than 0' })
    .max(MAX_QUANTITY, { error: 'Unit price cannot exceed 100,000' })
    .refine(hasAtMostTwoDecimals, { error: 'Unit price can have at most 2 decimal places' }),
  minStockLevel: z
    .number({ error: 'Minimum stock must be a number' })
    .int({ error: 'Minimum stock must be a whole number' })
    .min(0, { error: 'Minimum stock cannot be negative' })
    .max(MAX_QUANTITY, { error: 'Minimum stock cannot exceed 100,000' }),
  description: z.string().trim().max(500, { error: 'Description must be at most 500 characters' }),
  isActive: z.boolean(),
});

export const addBatchSchema = z.object({
  medicineId: z.string().min(1, { error: 'Select a medicine' }),
  batchNumber: text('Batch number', 2, 30).regex(/^[A-Za-z0-9-]+$/, {
    error: 'Use letters, numbers and hyphens only',
  }),
  quantity: quantity(),
  receivedDate: isoDate('Received date'),
  expiryDate: isoDate('Expiry date'),
  remarks: optionalRemarks(),
});

export function makeAddBatchSchema(today: Date) {
  const todayIso = todayISO(today);
  return addBatchSchema.superRefine((value, ctx) => {
    if (value.receivedDate > todayIso) {
      ctx.addIssue({
        code: 'custom',
        path: ['receivedDate'],
        message: 'Received date cannot be in the future',
      });
    }
    if (value.expiryDate <= todayIso || value.expiryDate <= value.receivedDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['expiryDate'],
        message: 'Expiry date must be after today and after the received date',
      });
    }
  });
}

export const receiveStockSchema = z.object({
  batchId: z.string().min(1, { error: 'Select a batch' }),
  quantity: quantity(),
  date: isoDate('Date'),
  remarks: optionalRemarks(),
});

export function makeReceiveStockSchema(today: Date) {
  const todayIso = todayISO(today);
  return receiveStockSchema.superRefine((value, ctx) => {
    if (value.date > todayIso) {
      ctx.addIssue({ code: 'custom', path: ['date'], message: 'Date cannot be in the future' });
    }
  });
}

export const adjustStockSchema = z
  .object({
    batchId: z.string().min(1, { error: 'Select a batch' }),
    direction: z.enum(['INCREASE', 'DECREASE'], { error: 'Choose increase or decrease' }),
    quantity: quantity(),
    reason: z.enum(ADJUSTMENT_REASONS, { error: 'Select a reason' }),
    remarks: optionalRemarks(),
  })
  .superRefine((value, ctx) => {
    if (value.reason === 'OTHER' && (value.remarks ?? '').length < 3) {
      ctx.addIssue({
        code: 'custom',
        path: ['remarks'],
        message: 'Remarks are required when the reason is Other',
      });
    }
  });

export const settingsSchema = z.object({
  pharmacyName: text('Pharmacy name', 2, 60),
  expiryAlertDays: z
    .number({ error: 'Alert days must be a number' })
    .int({ error: 'Alert days must be a whole number' })
    .min(1, { error: 'Alert days must be at least 1' })
    .max(365, { error: 'Alert days cannot exceed 365' }),
});

export type MedicineInput = z.infer<typeof medicineInputSchema>;
export type AddBatchInput = z.infer<typeof addBatchSchema>;
export type ReceiveStockInput = z.infer<typeof receiveStockSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
