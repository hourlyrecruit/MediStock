export type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

export function getPageItems(page: number, pageCount: number, siblings = 1): PageItem[] {
  const edgeCount = 3 + siblings * 2;
  if (pageCount <= edgeCount + 2) return range(1, pageCount);
  const left = Math.max(page - siblings, 1);
  const right = Math.min(page + siblings, pageCount);
  const showStart = left > 2;
  const showEnd = right < pageCount - 1;
  if (!showStart) return [...range(1, edgeCount), 'ellipsis-end', pageCount];
  if (!showEnd) return [1, 'ellipsis-start', ...range(pageCount - edgeCount + 1, pageCount)];
  return [1, 'ellipsis-start', ...range(left, right), 'ellipsis-end', pageCount];
}
