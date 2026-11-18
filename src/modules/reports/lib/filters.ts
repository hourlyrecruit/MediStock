import type { ReportRow } from '@/data';
import type { ReportFilterDef } from './reportMeta';

export type FilterValues = Record<string, string | undefined>;

export function filterOptions(rows: readonly ReportRow[], key: string): string[] {
  const values = new Set<string>();
  for (const row of rows) {
    const value = row[key];
    if (value !== undefined && value !== '') values.add(String(value));
  }
  return [...values].sort((a, b) => a.localeCompare(b, 'en'));
}

export function applyFilters(
  rows: readonly ReportRow[],
  filters: readonly ReportFilterDef[],
  values: FilterValues,
): ReportRow[] {
  const active = filters.filter((filter) => values[filter.key]);
  if (active.length === 0) return [...rows];
  return rows.filter((row) =>
    active.every((filter) => String(row[filter.key] ?? '') === values[filter.key]),
  );
}
