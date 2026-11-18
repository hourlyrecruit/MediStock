import { ADJUSTMENT_REASONS, TRANSACTION_TYPES } from '@/data/types';
import type {
  Batch,
  CategoryRef,
  CurrentUser,
  InventoryState,
  Medicine,
  ReferenceData,
  Settings,
  StockTransaction,
} from '@/data/types';

export type Guard<T> = (value: unknown) => value is T;
type Shape<T> = { [K in keyof T]-?: Guard<T[K]> };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === 'string';
const isId = (value: unknown): value is string => isString(value) && value.length > 0;
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const isInt = (value: unknown): value is number => isNumber(value) && Number.isInteger(value);
const isCount = (value: unknown): value is number => isInt(value) && value >= 0;
const isISODate = (value: unknown): value is string =>
  isString(value) && ISO_DATE.test(value) && !Number.isNaN(Date.parse(value));
const isISODateTime = (value: unknown): value is string =>
  isString(value) && !Number.isNaN(Date.parse(value));

const oneOf =
  <T extends string>(options: readonly T[]): Guard<T> =>
  (value): value is T =>
    isString(value) && (options as readonly string[]).includes(value);

const optional =
  <T>(guard: Guard<T>): Guard<T | undefined> =>
  (value): value is T | undefined =>
    value === undefined || guard(value);

function objectOf<T>(shape: Shape<T>): Guard<T> {
  return (value): value is T =>
    isRecord(value) &&
    (Object.keys(shape) as (keyof T)[]).every((key) => shape[key](value[key as string]));
}

export const isMedicine = objectOf<Medicine>({
  id: isId,
  name: isId,
  genericName: isId,
  category: isId,
  manufacturer: isString,
  unitPrice: (value): value is number => isNumber(value) && value >= 0,
  minStockLevel: isCount,
  description: isString,
  isActive: isBoolean,
  createdAt: isISODateTime,
  updatedAt: isISODateTime,
});

export const isBatch = objectOf<Batch>({
  id: isId,
  medicineId: isId,
  batchNumber: isId,
  openingQuantity: isCount,
  quantity: isCount,
  expiryDate: isISODate,
  receivedDate: isISODate,
  createdAt: isISODateTime,
});

export const isTransaction = objectOf<StockTransaction>({
  id: isId,
  medicineId: isId,
  batchId: isId,
  type: oneOf(TRANSACTION_TYPES),
  quantityChange: isInt,
  quantityAfter: isCount,
  date: isISODateTime,
  reason: optional(oneOf(ADJUSTMENT_REASONS)),
  remarks: optional(isString),
});

export const isSettings = objectOf<Settings>({
  pharmacyName: isId,
  currency: (value): value is 'INR' => value === 'INR',
  expiryAlertDays: (value): value is number => isInt(value) && value >= 1 && value <= 365,
});

const isCategoryRef = objectOf<CategoryRef>({ name: isId });

export const isReferenceData = objectOf<ReferenceData>({
  categories: (value): value is CategoryRef[] =>
    Array.isArray(value) && value.length > 0 && value.every(isCategoryRef),
});

export const isCurrentUser = objectOf<CurrentUser>({
  id: isId,
  name: isId,
  role: isString,
  email: isString,
});

export const isArrayOf =
  <T>(guard: Guard<T>): Guard<T[]> =>
  (value): value is T[] =>
    Array.isArray(value) && value.every(guard);

const recordOf =
  <T>(guard: Guard<T>): Guard<Record<string, T>> =>
  (value): value is Record<string, T> =>
    isRecord(value) && Object.values(value).every(guard);

export const isInventoryState = objectOf<InventoryState>({
  schemaVersion: (value): value is 2 => value === 2,
  medicines: recordOf(isMedicine),
  batches: recordOf(isBatch),
  transactions: isArrayOf(isTransaction),
  settings: isSettings,
  reference: isReferenceData,
  seededOn: isISODate,
});

export function parseInventoryState(value: unknown): InventoryState | null {
  return isInventoryState(value) ? value : null;
}
