import type { DefaultValues } from 'react-hook-form';
import type { Medicine, MedicineInput, MedicineView } from '@/data';
import type { MedicineFilters } from '../schemas/params';

export function filterMedicines(rows: readonly MedicineView[], filters: MedicineFilters) {
  return rows.filter((row) => {
    if (filters.category && row.category !== filters.category) return false;
    if (filters.status === 'active' && !row.isActive) return false;
    if (filters.status === 'inactive' && row.isActive) return false;
    return true;
  });
}

export function hasActiveFilters(filters: MedicineFilters) {
  return Boolean(filters.category) || filters.status !== 'all';
}

export function usableStockValue(view: MedicineView) {
  return Math.round(view.stock.usable * view.unitPrice * 100) / 100;
}

export function toFormValues(medicine?: Medicine): DefaultValues<MedicineInput> {
  if (!medicine) {
    return {
      name: '',
      genericName: '',
      manufacturer: '',
      description: '',
      isActive: true,
    };
  }
  return {
    name: medicine.name,
    genericName: medicine.genericName,
    category: medicine.category,
    manufacturer: medicine.manufacturer,
    unitPrice: medicine.unitPrice,
    minStockLevel: medicine.minStockLevel,
    description: medicine.description,
    isActive: medicine.isActive,
  };
}

export const MEDICINE_FORM_FIELDS = [
  'name',
  'genericName',
  'category',
  'manufacturer',
  'unitPrice',
  'minStockLevel',
  'description',
  'isActive',
] as const satisfies readonly (keyof MedicineInput)[];

export type MedicineFormField = (typeof MEDICINE_FORM_FIELDS)[number];

export function isMedicineFormField(field: string | undefined): field is MedicineFormField {
  return MEDICINE_FORM_FIELDS.some((candidate) => candidate === field);
}
