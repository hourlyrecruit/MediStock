import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/shared/cn';
import type { SortDir } from '@/shared/table';
import type { ColumnDef } from './types';

const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' };
const justifyClass = { left: 'justify-start', center: 'justify-center', right: 'justify-end' };

interface SortHeaderProps<T> {
  column: ColumnDef<T>;
  active: boolean;
  dir: SortDir;
  onSort: (id: string) => void;
  hideOnMobile: boolean;
}

export function SortHeader<T>({ column, active, dir, onSort, hideOnMobile }: SortHeaderProps<T>) {
  const align = column.align ?? 'left';
  const sortable = Boolean(column.sortValue);
  const ariaSort = !sortable
    ? undefined
    : active
      ? dir === 'asc'
        ? 'ascending'
        : 'descending'
      : 'none';
  const Icon = active ? (dir === 'asc' ? ArrowUp : ArrowDown) : ChevronsUpDown;

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      style={column.width ? { width: column.width } : undefined}
      className={cn(
        'border-border-subtle bg-bg-subtle text-fg-muted sticky top-0 z-10 h-11 border-b px-3 text-xs font-medium whitespace-nowrap first:pl-4 last:pr-4 2xl:px-4 2xl:first:pl-5 2xl:last:pr-5',
        alignClass[align],
        hideOnMobile && 'max-md:hidden',
        column.hideBelowXl && 'max-xl:hidden',
        column.headerClassName,
      )}
    >
      {sortable ? (
        <button
          type="button"
          onClick={() => onSort(column.id)}
          className={cn(
            'focus-ring group hover:bg-surface-muted hover:text-fg -mx-1.5 inline-flex h-8 items-center gap-1 rounded-sm px-1.5 transition-colors',
            justifyClass[align],
            active && 'text-fg',
          )}
        >
          {column.header}
          <Icon
            aria-hidden
            className={cn(
              'size-3.5 shrink-0 transition-opacity',
              active
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-60 group-focus-visible:opacity-60',
            )}
          />
        </button>
      ) : (
        column.header
      )}
    </th>
  );
}
