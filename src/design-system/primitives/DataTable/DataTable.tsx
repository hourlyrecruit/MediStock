import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { SearchX } from 'lucide-react';
import { cn } from '@/shared/cn';
import { useIsCompact } from '@/shared/hooks';
import { applyTableState, nextSort } from '@/shared/table';
import { Button } from '../Button/Button';
import { EmptyState } from '../EmptyState/EmptyState';
import { Pagination } from '../Pagination/Pagination';
import { SearchInput } from '../SearchInput/SearchInput';
import { SkeletonTable } from '../Skeleton/Skeleton';
import { TableDesktop } from './TableDesktop';
import { TableMobile } from './TableMobile';
import type { DataTableProps, DataTableViewProps } from './types';
import { useDataTableState } from './useDataTableState';

export function DataTable<T>({ state, onStateChange, defaultState, ...props }: DataTableProps<T>) {
  if (state && onStateChange)
    return <DataTableView {...props} state={state} onStateChange={onStateChange} />;
  return <UrlDataTable {...props} defaultState={defaultState} />;
}

function UrlDataTable<T>({
  defaultState,
  ...props
}: Omit<DataTableProps<T>, 'state' | 'onStateChange'>) {
  const [state, setState] = useDataTableState(defaultState);
  return <DataTableView {...props} state={state} onStateChange={setState} />;
}

export function DataTableView<T>({
  rows,
  columns,
  getRowId,
  caption,
  state,
  onStateChange,
  filters,
  actions,
  mobileCard,
  emptyState,
  flashIds,
  onRowClick,
  rowHref,
  loading,
  searchPlaceholder = 'Search',
  pageSizeOptions,
  itemLabel,
  className,
}: DataTableViewProps<T>) {
  const navigate = useNavigate();
  const isCompact = useIsCompact();
  const result = useMemo(() => applyTableState(rows, columns, state), [rows, columns, state]);
  const searchable = columns.some((column) => column.searchValue);
  const showCards = isCompact && Boolean(mobileCard);

  const activate =
    rowHref || onRowClick
      ? (row: T) => {
          if (onRowClick) onRowClick(row);
          if (rowHref) navigate(rowHref(row));
        }
      : undefined;

  const empty =
    emptyState && !state.q ? (
      emptyState
    ) : (
      <EmptyState
        icon={SearchX}
        title={state.q ? 'No matches' : 'Nothing here yet'}
        description={
          state.q
            ? `Nothing matches “${state.q}”. Try a different search.`
            : 'There is nothing to show.'
        }
        action={
          state.q ? (
            <Button variant="secondary" onClick={() => onStateChange({ q: '' })}>
              Clear search
            </Button>
          ) : undefined
        }
      />
    );

  const showToolbar = searchable || filters || actions;

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {showToolbar && (
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
          {searchable && (
            <SearchInput
              aria-label={`Search ${caption.toLowerCase()}`}
              placeholder={searchPlaceholder}
              value={state.q}
              onDebouncedChange={(q) => onStateChange({ q })}
              wrapperClassName="md:w-72"
            />
          )}
          {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
          {actions && <div className="flex flex-wrap items-center gap-2 md:ml-auto">{actions}</div>}
        </div>
      )}
      <div className="card overflow-hidden">
        {loading ? (
          <SkeletonTable rows={Math.min(state.size, 8)} columns={Math.min(columns.length, 5)} />
        ) : result.total === 0 ? (
          empty
        ) : showCards && mobileCard ? (
          <TableMobile
            rows={result.rows}
            getRowId={getRowId}
            caption={caption}
            render={mobileCard}
            rowHref={rowHref}
            onRowClick={onRowClick}
            flashIds={flashIds}
          />
        ) : (
          <TableDesktop
            rows={result.rows}
            columns={columns}
            getRowId={getRowId}
            caption={caption}
            state={state}
            onSort={(id) => onStateChange(nextSort(state, id))}
            flashIds={flashIds}
            onActivate={activate}
            hasMobileCard={Boolean(mobileCard)}
          />
        )}
        {!loading && result.total > 0 && (
          <div className="border-border-subtle border-t px-5 py-3 max-md:px-4">
            <Pagination
              page={result.page}
              pageSize={state.size}
              total={result.total}
              onPageChange={(page) => onStateChange({ page })}
              onPageSizeChange={(size) => onStateChange({ size })}
              pageSizeOptions={pageSizeOptions}
              itemLabel={itemLabel}
            />
          </div>
        )}
      </div>
    </div>
  );
}
