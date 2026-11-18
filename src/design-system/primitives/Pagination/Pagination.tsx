import { useId } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/cn';
import { formatNumber } from '@/shared/format';
import { IconButton } from '../Button/IconButton';
import { Select } from '../Select/Select';
import { getPageItems } from './pageItems';

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: readonly number[];
  itemLabel?: string;
  className?: string;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  itemLabel = 'results',
  className,
}: PaginationProps) {
  const sizeId = useId();
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(page, 1), pageCount);
  const start = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, total);

  return (
    <div
      className={cn(
        'text-fg-muted flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm',
        className,
      )}
    >
      <p className="tabular" aria-live="polite">
        Showing <span className="text-fg font-medium">{formatNumber(start)}</span>–
        <span className="text-fg font-medium">{formatNumber(end)}</span> of{' '}
        <span className="text-fg font-medium">{formatNumber(total)}</span> {itemLabel}
      </p>
      <div className="flex items-center gap-4">
        {onPageSizeChange && (
          <div className="hidden items-center gap-2 sm:flex">
            <label htmlFor={sizeId} className="whitespace-nowrap">
              Rows per page
            </label>
            <Select
              id={sizeId}
              value={String(pageSize)}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              wrapperClassName="w-20"
              className="h-9"
              options={pageSizeOptions.map((size) => ({
                value: String(size),
                label: String(size),
              }))}
            />
          </div>
        )}
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <IconButton
            aria-label="Previous page"
            size="sm"
            variant="ghost"
            icon={<ChevronLeft className="size-4" />}
            disabled={current <= 1}
            onClick={() => onPageChange(current - 1)}
          />
          <ul className="hidden items-center gap-1 md:flex">
            {getPageItems(current, pageCount).map((item) =>
              typeof item === 'number' ? (
                <li key={item}>
                  <button
                    type="button"
                    aria-label={`Page ${item}`}
                    aria-current={item === current ? 'page' : undefined}
                    onClick={() => onPageChange(item)}
                    className={cn(
                      'focus-ring tabular grid h-9 min-w-9 place-items-center rounded-md px-2 text-sm font-medium transition-colors active:scale-[0.97]',
                      item === current
                        ? 'bg-primary-tint text-primary-press dark:text-primary'
                        : 'text-fg-muted hover:bg-surface-muted hover:text-fg',
                    )}
                  >
                    {item}
                  </button>
                </li>
              ) : (
                <li
                  key={item}
                  aria-hidden
                  className="text-fg-faint grid h-9 w-6 place-items-center"
                >
                  …
                </li>
              ),
            )}
          </ul>
          <span className="tabular px-2 md:hidden">
            {current} / {pageCount}
          </span>
          <IconButton
            aria-label="Next page"
            size="sm"
            variant="ghost"
            icon={<ChevronRight className="size-4" />}
            disabled={current >= pageCount}
            onClick={() => onPageChange(current + 1)}
          />
        </nav>
      </div>
    </div>
  );
}
