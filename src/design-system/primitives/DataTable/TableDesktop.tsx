import { useEffect, useState, type KeyboardEvent } from 'react';
import { flashClass } from '../../motion/useFlash';
import { m, type Variants } from 'framer-motion';
import { useReducedMotion } from '@/shared/hooks/useMotion';
import { cn } from '@/shared/cn';
import type { TableState } from '@/shared/table';
import { durations, easings, stagger } from '../../motion/tokens';
import { isFromInteractiveChild } from './rowInteraction';
import { SortHeader } from './SortHeader';
import type { ColumnDef } from './types';

const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' };

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 4 },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index < 12 ? index * stagger.rows : 0,
      duration: durations.ui,
      ease: easings.out,
    },
  }),
};

interface TableDesktopProps<T> {
  rows: readonly T[];
  columns: readonly ColumnDef<T>[];
  getRowId: (row: T) => string;
  caption: string;
  state: TableState;
  onSort: (id: string) => void;
  flashIds?: ReadonlySet<string>;
  onActivate?: (row: T) => void;
  hasMobileCard: boolean;
}

export function TableDesktop<T>({
  rows,
  columns,
  getRowId,
  caption,
  state,
  onSort,
  flashIds,
  onActivate,
  hasMobileCard,
}: TableDesktopProps<T>) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const ids = rows.map(getRowId);
  const hideOnMobile = (column: ColumnDef<T>) => Boolean(column.hideOnMobile) && !hasMobileCard;

  const handleKey = (event: KeyboardEvent<HTMLTableRowElement>, row: T) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (isFromInteractiveChild(event)) return;
    event.preventDefault();
    onActivate?.(row);
  };

  return (
    <div className="max-h-[min(72dvh,880px)] overflow-auto overscroll-x-contain">
      <table className="w-full border-separate border-spacing-0 text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <SortHeader
                key={column.id}
                column={column}
                active={state.sort === column.id}
                dir={state.dir}
                onSort={onSort}
                hideOnMobile={hideOnMobile(column)}
              />
            ))}
          </tr>
        </thead>
        <m.tbody
          key={ids.join('|')}
          initial={mounted ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.12, ease: easings.out }}
        >
          {rows.map((row, index) => {
            const id = ids[index] ?? String(index);
            return (
              <m.tr
                key={id}
                custom={index}
                variants={rowVariants}
                initial={mounted || reduce ? false : 'hidden'}
                animate="show"
                tabIndex={onActivate ? 0 : undefined}
                onClick={
                  onActivate
                    ? (event) => {
                        if (!isFromInteractiveChild(event)) onActivate(row);
                      }
                    : undefined
                }
                onKeyDown={onActivate ? (event) => handleKey(event, row) : undefined}
                className={cn(
                  'group/row hover:bg-bg-subtle transition-colors',
                  onActivate &&
                    'focus-visible:bg-bg-subtle focus-visible:ring-ring cursor-pointer focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
                  flashClass(flashIds, id),
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      'border-border-subtle text-fg h-14 border-b px-3 py-2 align-middle group-last/row:border-b-0 first:pl-4 last:pr-4 2xl:px-4 2xl:first:pl-5 2xl:last:pr-5',
                      alignClass[column.align ?? 'left'],
                      column.align === 'right' && 'tabular',
                      hideOnMobile(column) && 'max-md:hidden',
                      column.hideBelowXl && 'max-xl:hidden',
                      column.className,
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </m.tr>
            );
          })}
        </m.tbody>
      </table>
    </div>
  );
}
