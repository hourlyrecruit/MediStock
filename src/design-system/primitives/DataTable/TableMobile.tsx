import type { ReactNode } from 'react';
import { flashClass } from '../../motion/useFlash';
import { m } from 'framer-motion';
import { Link } from 'react-router';
import { cn } from '@/shared/cn';
import { easings } from '../../motion/tokens';

interface TableMobileProps<T> {
  rows: readonly T[];
  getRowId: (row: T) => string;
  caption: string;
  render: (row: T) => ReactNode;
  rowHref?: (row: T) => string;
  onRowClick?: (row: T) => void;
  flashIds?: ReadonlySet<string>;
}

export function TableMobile<T>({
  rows,
  getRowId,
  caption,
  render,
  rowHref,
  onRowClick,
  flashIds,
}: TableMobileProps<T>) {
  const ids = rows.map(getRowId);
  return (
    <m.ul
      key={ids.join('|')}
      aria-label={caption}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.12, ease: easings.out }}
      className="divide-border-subtle flex flex-col divide-y"
    >
      {rows.map((row, index) => {
        const id = ids[index] ?? String(index);
        const itemClass = cn('block w-full p-4 text-left', flashClass(flashIds, id));
        return (
          <li key={id}>
            {rowHref ? (
              <Link
                to={rowHref(row)}
                className={cn(itemClass, 'focus-ring hover:bg-bg-subtle active:bg-surface-muted')}
              >
                {render(row)}
              </Link>
            ) : onRowClick ? (
              <button
                type="button"
                onClick={() => onRowClick(row)}
                className={cn(itemClass, 'focus-ring hover:bg-bg-subtle active:bg-surface-muted')}
              >
                {render(row)}
              </button>
            ) : (
              <div className={itemClass}>{render(row)}</div>
            )}
          </li>
        );
      })}
    </m.ul>
  );
}
