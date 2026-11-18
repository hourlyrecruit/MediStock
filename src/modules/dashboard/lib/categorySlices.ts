import type { CategorySlice } from '@/data';

export interface DonutSlice {
  key: string;
  label: string;
  units: number;
  medicines: number;
  color: string;
}

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-7)',
] as const;

const colorAt = (index: number): string =>
  COLORS[Math.min(index, COLORS.length - 1)] ?? 'var(--chart-7)';

export function toDonutSlices(slices: readonly CategorySlice[]): DonutSlice[] {
  const sorted = [...slices].sort(
    (a, b) => b.usableUnits - a.usableUnits || a.category.localeCompare(b.category),
  );
  const overflow = sorted.length > COLORS.length;
  const head = overflow ? sorted.slice(0, COLORS.length - 1) : sorted;
  const tail = overflow ? sorted.slice(COLORS.length - 1) : [];
  const result: DonutSlice[] = head.map((slice, index) => ({
    key: slice.category,
    label: slice.category,
    units: slice.usableUnits,
    medicines: slice.medicines,
    color: colorAt(index),
  }));
  if (tail.length > 0) {
    result.push({
      key: 'other',
      label: 'Other',
      units: tail.reduce((sum, slice) => sum + slice.usableUnits, 0),
      medicines: tail.reduce((sum, slice) => sum + slice.medicines, 0),
      color: colorAt(COLORS.length - 1),
    });
  }
  return result;
}
