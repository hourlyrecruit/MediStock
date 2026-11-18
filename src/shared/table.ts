export type SortDir = 'asc' | 'desc';

export type SortValue = string | number | boolean | Date | null | undefined;

export interface TableState {
  q: string;
  sort?: string;
  dir: SortDir;
  page: number;
  size: number;
}

export interface TableColumn<T> {
  id: string;
  sortValue?: (row: T) => SortValue;
  searchValue?: (row: T) => string | number | readonly (string | number | null | undefined)[] | null | undefined;
}

export interface PageSlice<T> {
  rows: T[];
  page: number;
  pageCount: number;
  total: number;
  start: number;
  end: number;
}

export interface TableResult<T> extends PageSlice<T> {
  filtered: T[];
}

export const DEFAULT_TABLE_STATE: TableState = { q: '', dir: 'asc', page: 1, size: 10 };

const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

function normalize(text: string) {
  return text.toLocaleLowerCase('en').normalize('NFKD').replace(/[̀-ͯ]/g, '');
}

function searchText<T>(row: T, columns: readonly TableColumn<T>[]) {
  const parts: string[] = [];
  for (const column of columns) {
    if (!column.searchValue) continue;
    const value = column.searchValue(row);
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) if (item !== null && item !== undefined) parts.push(String(item));
    } else {
      parts.push(String(value));
    }
  }
  return normalize(parts.join(' '));
}

export function filterRows<T>(rows: readonly T[], columns: readonly TableColumn<T>[], query: string): T[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [...rows];
  const searchable = columns.filter((column) => column.searchValue);
  if (searchable.length === 0) return [...rows];
  return rows.filter((row) => {
    const haystack = searchText(row, searchable);
    return terms.every((term) => haystack.includes(term));
  });
}

function toComparable(value: SortValue): string | number | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isNaN(time) ? null : time;
  }
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return Number.isNaN(value) ? null : value;
  return value;
}

export function compareValues(a: SortValue, b: SortValue): number {
  const left = toComparable(a);
  const right = toComparable(b);
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  if (typeof left === 'number' && typeof right === 'number') return left - right;
  return collator.compare(String(left), String(right));
}

export function sortRows<T>(
  rows: readonly T[],
  columns: readonly TableColumn<T>[],
  sort: string | undefined,
  dir: SortDir = 'asc',
): T[] {
  const column = sort ? columns.find((candidate) => candidate.id === sort) : undefined;
  const getValue = column?.sortValue;
  if (!getValue) return [...rows];
  const sign = dir === 'desc' ? -1 : 1;
  return rows
    .map((row, index) => ({ row, index, value: getValue(row) }))
    .sort((a, b) => {
      const aMissing = toComparable(a.value) === null;
      const bMissing = toComparable(b.value) === null;
      if (aMissing !== bMissing) return aMissing ? 1 : -1;
      const result = compareValues(a.value, b.value) * sign;
      return result === 0 ? a.index - b.index : result;
    })
    .map((entry) => entry.row);
}

export function paginate<T>(rows: readonly T[], page: number, size: number): PageSlice<T> {
  const safeSize = Number.isFinite(size) && size > 0 ? Math.floor(size) : DEFAULT_TABLE_STATE.size;
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / safeSize));
  const requested = Number.isFinite(page) ? Math.floor(page) : 1;
  const current = Math.min(Math.max(1, requested), pageCount);
  const offset = (current - 1) * safeSize;
  const slice = rows.slice(offset, offset + safeSize);
  return {
    rows: slice,
    page: current,
    pageCount,
    total,
    start: total === 0 ? 0 : offset + 1,
    end: offset + slice.length,
  };
}

export function applyTableState<T>(
  rows: readonly T[],
  columns: readonly TableColumn<T>[],
  state: Partial<TableState>,
): TableResult<T> {
  const merged = { ...DEFAULT_TABLE_STATE, ...state };
  const filtered = sortRows(filterRows(rows, columns, merged.q), columns, merged.sort, merged.dir);
  return { filtered, ...paginate(filtered, merged.page, merged.size) };
}

export function nextSort(
  current: Pick<TableState, 'sort' | 'dir'>,
  columnId: string,
): Pick<TableState, 'sort' | 'dir'> {
  if (current.sort !== columnId) return { sort: columnId, dir: 'asc' };
  if (current.dir === 'asc') return { sort: columnId, dir: 'desc' };
  return { sort: undefined, dir: 'asc' };
}
