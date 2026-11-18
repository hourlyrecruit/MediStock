import type { ID, InventoryState, Medicine, Result } from '@/data/types';
import { canDeleteMedicine } from '@/data/selectors/stock';
import { createId, err, ok, validationError } from './result';
import { medicineInputSchema } from './schemas';
import type { MedicineInput } from './schemas';

export type UpdateMedicineInput = MedicineInput & { id: ID };

function normalise(value: string) {
  return value.trim().toLowerCase();
}

function findDuplicate(state: InventoryState, input: MedicineInput, exceptId?: ID) {
  const name = normalise(input.name);
  const genericName = normalise(input.genericName);
  return Object.values(state.medicines).find(
    (medicine) =>
      medicine.id !== exceptId &&
      normalise(medicine.name) === name &&
      normalise(medicine.genericName) === genericName,
  );
}

function unknownCategory(state: InventoryState, input: MedicineInput) {
  return !state.reference.categories.some((category) => category.name === input.category);
}

function categoryError<T>(): Result<T> {
  return err('VALIDATION', 'Select a category', 'category');
}

function duplicateError<T>(input: MedicineInput): Result<T> {
  return err('DUPLICATE_MEDICINE', `${input.name} (${input.genericName}) already exists`, 'name');
}

export function createMedicine(
  state: InventoryState,
  input: MedicineInput,
  now: Date,
): Result<{ state: InventoryState; medicine: Medicine }> {
  const parsed = medicineInputSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const data = parsed.data;
  if (unknownCategory(state, data)) return categoryError();
  if (findDuplicate(state, data)) return duplicateError(data);
  const timestamp = now.toISOString();
  const medicine: Medicine = {
    id: createId('med'),
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  return ok({
    state: { ...state, medicines: { ...state.medicines, [medicine.id]: medicine } },
    medicine,
  });
}

export function updateMedicine(
  state: InventoryState,
  input: UpdateMedicineInput,
  now: Date,
): Result<{ state: InventoryState; medicine: Medicine }> {
  const existing = state.medicines[input.id];
  if (!existing) return err('NOT_FOUND', 'Medicine not found');
  const { id: _id, ...fields } = input;
  const parsed = medicineInputSchema.safeParse(fields);
  if (!parsed.success) return validationError(parsed.error);
  const data = parsed.data;
  if (data.category !== existing.category && unknownCategory(state, data)) return categoryError();
  if (findDuplicate(state, data, existing.id)) return duplicateError(data);
  const medicine: Medicine = { ...existing, ...data, updatedAt: now.toISOString() };
  return ok({
    state: { ...state, medicines: { ...state.medicines, [medicine.id]: medicine } },
    medicine,
  });
}

export function setMedicineActive(
  state: InventoryState,
  input: { id: ID; isActive: boolean },
  now: Date,
): Result<{ state: InventoryState; medicine: Medicine; previous: boolean }> {
  const existing = state.medicines[input.id];
  if (!existing) return err('NOT_FOUND', 'Medicine not found');
  if (typeof input.isActive !== 'boolean') {
    return err('VALIDATION', 'Active flag must be true or false', 'isActive');
  }
  const medicine: Medicine = {
    ...existing,
    isActive: input.isActive,
    updatedAt: now.toISOString(),
  };
  return ok({
    state: { ...state, medicines: { ...state.medicines, [medicine.id]: medicine } },
    medicine,
    previous: existing.isActive,
  });
}

export function deleteMedicine(
  state: InventoryState,
  input: { id: ID },
  _now?: Date,
): Result<{ state: InventoryState; medicine: Medicine }> {
  const existing = state.medicines[input.id];
  if (!existing) return err('NOT_FOUND', 'Medicine not found');
  if (!canDeleteMedicine(state, existing.id)) {
    return err(
      'MEDICINE_HAS_HISTORY',
      `${existing.name} has stock history. Deactivate it instead.`,
    );
  }
  const { [existing.id]: _removed, ...medicines } = state.medicines;
  return ok({ state: { ...state, medicines }, medicine: existing });
}
