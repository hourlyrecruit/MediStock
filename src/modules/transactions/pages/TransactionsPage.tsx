import { useMemo } from 'react';
import { ArrowLeftRight, FilterX } from 'lucide-react';
import { selectTransactionViews, TRANSACTION_TYPES, useInventory } from '@/data';
import {
  Button,
  DataTable,
  DateInput,
  EmptyState,
  PageHeader,
  Select,
  TransactionTypeBadge,
} from '@/design-system';
import { formatDateTime, formatNumber } from '@/shared/format';
import { useUrlState } from '@/shared/hooks';
import { TRANSACTION_TYPE_LABEL } from '@/shared/labels';
import {
  MedicineLink,
  QuantityChange,
  TransactionNote,
  transactionColumns,
} from '../components/transactionColumns';
import { filterTransactions, transactionFilterSchema } from '../components/transactionFilters';

const TYPE_OPTIONS = TRANSACTION_TYPES.map((type) => ({
  value: type,
  label: TRANSACTION_TYPE_LABEL[type],
}));

export function TransactionsPage() {
  const transactions = useInventory(selectTransactionViews);
  const [filters, setFilters] = useUrlState(transactionFilterSchema);
  const rows = useMemo(() => filterTransactions(transactions, filters), [transactions, filters]);
  const filtered = Boolean(filters.type || filters.from || filters.to);
  const clear = () => setFilters({ type: undefined, from: undefined, to: undefined });

  return (
    <>
      <PageHeader
        title="Transactions"
        description="An immutable log of every stock movement. Entries can’t be edited or deleted."
      />
      <DataTable
        rows={rows}
        columns={transactionColumns}
        getRowId={(row) => row.id}
        caption="Transactions"
        itemLabel="transactions"
        searchPlaceholder="Search medicine, batch or remarks"
        defaultState={{ sort: 'date', dir: 'desc' }}
        filters={
          <>
            <Select
              aria-label="Filter by type"
              placeholder="All types"
              wrapperClassName="w-full md:w-44"
              value={filters.type ?? ''}
              options={TYPE_OPTIONS}
              onChange={(event) =>
                setFilters({ type: TRANSACTION_TYPES.find((type) => type === event.target.value) })
              }
            />
            <div className="flex w-full items-center gap-2 md:w-auto">
              <DateInput
                aria-label="From date"
                className="md:w-40"
                value={filters.from ?? ''}
                max={filters.to}
                onChange={(event) => setFilters({ from: event.target.value || undefined })}
              />
              <span className="text-fg-muted text-sm">to</span>
              <DateInput
                aria-label="To date"
                className="md:w-40"
                value={filters.to ?? ''}
                min={filters.from}
                onChange={(event) => setFilters({ to: event.target.value || undefined })}
              />
            </div>
            {filtered && (
              <Button variant="ghost" leadingIcon={<FilterX className="size-4" />} onClick={clear}>
                Clear filters
              </Button>
            )}
          </>
        }
        emptyState={
          filtered ? (
            <EmptyState
              icon={FilterX}
              title="No transactions match these filters"
              description="Widen the date range or choose another type."
              action={
                <Button variant="secondary" onClick={clear}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={ArrowLeftRight}
              title="No transactions yet"
              description="Stock movements appear here as soon as you add a batch, receive stock or make an adjustment."
            />
          )
        }
        mobileCard={(row) => (
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <MedicineLink row={row} className="block truncate font-medium" />
                <p className="tabular text-fg-muted text-xs">
                  {row.batchNumber} · {formatDateTime(row.date)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end">
                <QuantityChange value={row.quantityChange} />
                <span className="tabular text-fg-muted text-xs">
                  Qty after {formatNumber(row.quantityAfter)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <TransactionTypeBadge type={row.type} size="sm" />
              <TransactionNote row={row} className="block min-w-0 truncate text-right text-xs" />
            </div>
          </div>
        )}
      />
    </>
  );
}
