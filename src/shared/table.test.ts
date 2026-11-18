import { describe, expect, it } from 'vitest';
import { applyTableState, filterRows, nextSort, paginate, sortRows, type TableColumn } from './table';

interface Row {
  id: string;
  name: string;
  generic: string;
  qty: number | null;
  expiry?: Date;
  tags?: string[];
}

const rows: Row[] = [
  { id: 'a', name: 'Paracetamol 500', generic: 'Acetaminophen', qty: 40, expiry: new Date('2027-01-10'), tags: ['fever'] },
  { id: 'b', name: 'Amoxicillin', generic: 'Amoxicillin', qty: 5, expiry: new Date('2026-12-01') },
  { id: 'c', name: 'paracetamol 650', generic: 'Acetaminophen', qty: 40, tags: ['pain'] },
  { id: 'd', name: 'Cétirizine', generic: 'Cetirizine', qty: null, expiry: new Date('2026-11-15') },
  { id: 'e', name: 'Ibuprofen', generic: 'Ibuprofen', qty: 12, expiry: new Date('2027-03-01') },
];

const columns: TableColumn<Row>[] = [
  { id: 'name', sortValue: (r) => r.name, searchValue: (r) => [r.name, r.generic] },
  { id: 'qty', sortValue: (r) => r.qty, searchValue: (r) => r.qty },
  { id: 'expiry', sortValue: (r) => r.expiry },
  { id: 'tags', searchValue: (r) => r.tags },
];

const ids = (list: Row[]) => list.map((r) => r.id);

describe('filterRows', () => {
  it('returns a copy of every row for an empty or blank query', () => {
    const result = filterRows(rows, columns, '   ');
    expect(ids(result)).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(result).not.toBe(rows);
  });

  it('matches case-insensitively across every searchValue', () => {
    expect(ids(filterRows(rows, columns, 'PARACETAMOL'))).toEqual(['a', 'c']);
    expect(ids(filterRows(rows, columns, 'acetaminophen'))).toEqual(['a', 'c']);
    expect(ids(filterRows(rows, columns, 'pain'))).toEqual(['c']);
  });

  it('requires every term to match', () => {
    expect(ids(filterRows(rows, columns, 'paracetamol 650'))).toEqual(['c']);
    expect(ids(filterRows(rows, columns, 'paracetamol zzz'))).toEqual([]);
  });

  it('ignores diacritics and searches numbers', () => {
    expect(ids(filterRows(rows, columns, 'cetirizine'))).toEqual(['d']);
    expect(ids(filterRows(rows, columns, '12'))).toEqual(['e']);
  });

  it('returns every row when no column is searchable', () => {
    expect(filterRows(rows, [{ id: 'qty', sortValue: (r) => r.qty }], 'x')).toHaveLength(5);
  });
});

describe('sortRows', () => {
  it('sorts strings naturally and case-insensitively', () => {
    expect(ids(sortRows(rows, columns, 'name', 'asc'))).toEqual(['b', 'd', 'e', 'a', 'c']);
  });

  it('is stable for equal values in both directions', () => {
    expect(ids(sortRows(rows, columns, 'qty', 'asc'))).toEqual(['b', 'e', 'a', 'c', 'd']);
    expect(ids(sortRows(rows, columns, 'qty', 'desc'))).toEqual(['a', 'c', 'e', 'b', 'd']);
  });

  it('keeps missing values last regardless of direction', () => {
    expect(ids(sortRows(rows, columns, 'expiry', 'asc')).at(-1)).toBe('c');
    expect(ids(sortRows(rows, columns, 'expiry', 'desc')).at(-1)).toBe('c');
    expect(ids(sortRows(rows, columns, 'expiry', 'desc'))).toEqual(['e', 'a', 'b', 'd', 'c']);
  });

  it('leaves order untouched for unknown or unsortable columns', () => {
    expect(ids(sortRows(rows, columns, 'missing', 'desc'))).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(ids(sortRows(rows, columns, 'tags', 'desc'))).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(ids(sortRows(rows, columns, undefined))).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
});

describe('paginate', () => {
  const many = Array.from({ length: 38 }, (_, i) => i + 1);

  it('slices the requested page with a 1-based range', () => {
    const slice = paginate(many, 2, 10);
    expect(slice.rows).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(slice).toMatchObject({ page: 2, pageCount: 4, total: 38, start: 11, end: 20 });
  });

  it('returns a partial last page', () => {
    expect(paginate(many, 4, 10)).toMatchObject({ start: 31, end: 38, rows: [31, 32, 33, 34, 35, 36, 37, 38] });
  });

  it('clamps pages above and below the range', () => {
    expect(paginate(many, 99, 10).page).toBe(4);
    expect(paginate(many, 0, 10).page).toBe(1);
    expect(paginate(many, -3, 10).page).toBe(1);
    expect(paginate(many, Number.NaN, 10).page).toBe(1);
  });

  it('handles empty input and invalid sizes', () => {
    expect(paginate([], 3, 10)).toEqual({ rows: [], page: 1, pageCount: 1, total: 0, start: 0, end: 0 });
    expect(paginate(many, 1, 0).rows).toHaveLength(10);
  });
});

describe('applyTableState', () => {
  it('filters, sorts and paginates while exposing every filtered row', () => {
    const result = applyTableState(rows, columns, { q: 'a', sort: 'qty', dir: 'desc', page: 1, size: 2 });
    expect(ids(result.filtered)).toEqual(['a', 'c', 'b']);
    expect(ids(result.rows)).toEqual(['a', 'c']);
    expect(result).toMatchObject({ total: 3, pageCount: 2, page: 1 });
  });

  it('clamps the page after filtering shrinks the result', () => {
    const result = applyTableState(rows, columns, { q: 'ibuprofen', page: 3, size: 2 });
    expect(result.page).toBe(1);
    expect(ids(result.rows)).toEqual(['e']);
  });

  it('falls back to defaults for missing state', () => {
    expect(applyTableState(rows, columns, {}).rows).toHaveLength(5);
  });
});

describe('nextSort', () => {
  it('cycles ascending, descending, then none', () => {
    expect(nextSort({ dir: 'asc' }, 'name')).toEqual({ sort: 'name', dir: 'asc' });
    expect(nextSort({ sort: 'name', dir: 'asc' }, 'name')).toEqual({ sort: 'name', dir: 'desc' });
    expect(nextSort({ sort: 'name', dir: 'desc' }, 'name')).toEqual({ sort: undefined, dir: 'asc' });
    expect(nextSort({ sort: 'qty', dir: 'desc' }, 'name')).toEqual({ sort: 'name', dir: 'asc' });
  });
});
