import { format, startOfDay } from 'date-fns';

export interface CsvColumn {
  key: string;
  header: string;
}

export type CsvCell = string | number | null | undefined;
export type CsvRow = Record<string, CsvCell>;

const FORMULA_PREFIX = /^[=+\-@\t\r]/;

export function escapeCsvCell(value: CsvCell): string {
  if (value === null || value === undefined) return '';
  let text = typeof value === 'number' ? String(value) : value;
  if (typeof value === 'string' && FORMULA_PREFIX.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(columns: readonly CsvColumn[], rows: readonly CsvRow[]): string {
  const lines = [
    columns.map((column) => escapeCsvCell(column.header)).join(','),
    ...rows.map((row) => columns.map((column) => escapeCsvCell(row[column.key])).join(',')),
  ];
  return lines.join('\r\n');
}

export const CSV_BOM = '\uFEFF';

export function csvBlob(csv: string): Blob {
  return new Blob([CSV_BOM + csv], { type: 'text/csv;charset=utf-8' });
}

export function downloadCsv(filename: string, csv: string): void {
  const url = URL.createObjectURL(csvBlob(csv));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function reportFilename(reportId: string, today: Date): string {
  return `medistock-${reportId}-${format(startOfDay(today), 'yyyy-MM-dd')}.csv`;
}
