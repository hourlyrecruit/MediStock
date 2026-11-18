import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  Boxes,
  Eye,
  EyeOff,
  FilterX,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import {
  EXPIRY_STATUSES,
  selectBatchViews,
  selectMedicineViews,
  useInventory,
  type BatchView,
  type ID,
} from '@/data';
import {
  Button,
  DataTable,
  EmptyState,
  ExpiryBadge,
  PageHeader,
  Select,
  useFlash,
} from '@/design-system';
import { formatDate } from '@/shared/format';
import { useUrlState } from '@/shared/hooks';
import { EXPIRY_STATUS_LABEL } from '@/shared/labels';
import { STATUS_PARAM } from '@/shared/routes';
import { BatchActions, type BatchActionHandlers } from '../components/BatchActions';
import { BatchHistorySheet } from '../components/BatchHistorySheet';
import { BatchQuantity, buildBatchColumns, MedicineLink } from '../components/batchColumns';
import { AddBatchDialog, AdjustStockDialog, ReceiveStockDialog } from '../components/StockDialogs';
import { filterBatches, STATUS_FILTERS, stockFilterSchema } from '../components/stockFilters';

type DialogKind = 'add' | 'receive' | 'adjust';

interface DialogTarget {
  kind: DialogKind | null;
  batchId?: ID;
  medicineId?: ID;
}

const STATUS_OPTIONS = EXPIRY_STATUSES.map((status) => ({
  value: STATUS_PARAM[status],
  label: EXPIRY_STATUS_LABEL[status],
})).reverse();

export function StockPage() {
  const batches = useInventory(selectBatchViews);
  const medicines = useInventory(selectMedicineViews);
  const [filters, setFilters] = useUrlState(stockFilterSchema);
  const [dialog, setDialog] = useState<DialogTarget>({ kind: null });
  const [history, setHistory] = useState<{ open: boolean; batchId: ID | null }>({
    open: false,
    batchId: null,
  });
  const [changed, setChanged] = useState<ID[]>([]);
  const flashIds = useFlash(changed);

  useEffect(() => {
    if (changed.length === 0) return;
    const timer = window.setTimeout(() => setChanged([]), 1400);
    return () => window.clearTimeout(timer);
  }, [changed]);

  const rows = useMemo(() => filterBatches(batches, filters), [batches, filters]);
  const hiddenEmpty = useMemo(
    () =>
      filters.empty === 'show'
        ? 0
        : filterBatches(batches, { ...filters, empty: 'show' }).length - rows.length,
    [batches, filters, rows.length],
  );
  const medicineOptions = useMemo(
    () =>
      medicines
        .filter((medicine) => medicine.stock.batchCount > 0)
        .map((medicine) => ({ value: medicine.id, label: medicine.name })),
    [medicines],
  );

  const handlers = useMemo<BatchActionHandlers>(
    () => ({
      onReceive: (batch: BatchView) => setDialog({ kind: 'receive', batchId: batch.id }),
      onAdjust: (batch: BatchView) => setDialog({ kind: 'adjust', batchId: batch.id }),
      onHistory: (batch: BatchView) => setHistory({ open: true, batchId: batch.id }),
    }),
    [],
  );
  const columns = useMemo(() => buildBatchColumns(handlers), [handlers]);

  const filtered = Boolean(filters.medicine || filters.status);
  const closeDialog = (open: boolean) => {
    if (!open) setDialog((current) => ({ ...current, kind: null }));
  };
  const onDone = (batchId: ID) => setChanged([batchId]);
  const openFromHistory = (kind: DialogKind, batchId: ID) => {
    setHistory((current) => ({ ...current, open: false }));
    setDialog({ kind, batchId });
  };

  return (
    <>
      <PageHeader
        title="Stock Management"
        description="Every batch on hand, soonest expiry first. Receive deliveries, add new lots and correct counts."
        actions={
          <>
            <Button
              variant="secondary"
              leadingIcon={<SlidersHorizontal className="size-4" />}
              onClick={() => setDialog({ kind: 'adjust', medicineId: filters.medicine })}
            >
              Adjust stock
            </Button>
            <Button
              variant="secondary"
              leadingIcon={<ArrowDownToLine className="size-4" />}
              onClick={() => setDialog({ kind: 'receive', medicineId: filters.medicine })}
            >
              Receive stock
            </Button>
            <Button
              leadingIcon={<Plus className="size-4" />}
              onClick={() => setDialog({ kind: 'add' })}
            >
              Add batch
            </Button>
          </>
        }
      />
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        caption="Batches"
        itemLabel="batches"
        searchPlaceholder="Search batch or medicine"
        defaultState={{ sort: 'expiry', dir: 'asc' }}
        flashIds={flashIds}
        filters={
          <>
            <Select
              aria-label="Filter by medicine"
              placeholder="All medicines"
              wrapperClassName="w-full md:w-56"
              value={filters.medicine ?? ''}
              options={medicineOptions}
              onChange={(event) => setFilters({ medicine: event.target.value || undefined })}
            />
            <Select
              aria-label="Filter by status"
              placeholder="All statuses"
              wrapperClassName="w-full md:w-44"
              value={filters.status ?? ''}
              options={STATUS_OPTIONS}
              onChange={(event) =>
                setFilters({ status: STATUS_FILTERS.find((value) => value === event.target.value) })
              }
            />
            <Button
              variant={filters.empty === 'show' ? 'subtle' : 'ghost'}
              aria-pressed={filters.empty === 'show'}
              leadingIcon={
                filters.empty === 'show' ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeOff className="size-4" />
                )
              }
              onClick={() => setFilters({ empty: filters.empty === 'show' ? undefined : 'show' })}
            >
              {filters.empty === 'show'
                ? 'Showing empty'
                : `Show empty${hiddenEmpty > 0 ? ` (${hiddenEmpty})` : ''}`}
            </Button>
            {filtered && (
              <Button
                variant="ghost"
                leadingIcon={<FilterX className="size-4" />}
                onClick={() => setFilters({ medicine: undefined, status: undefined })}
              >
                Clear filters
              </Button>
            )}
          </>
        }
        emptyState={
          filtered ? (
            <EmptyState
              icon={FilterX}
              title="No batches match these filters"
              description="Try another medicine or status."
              action={
                <Button
                  variant="secondary"
                  onClick={() => setFilters({ medicine: undefined, status: undefined })}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Boxes}
              title="No batches in stock"
              description="Add a batch to start tracking stock and expiry."
              action={
                <Button
                  leadingIcon={<Plus className="size-4" />}
                  onClick={() => setDialog({ kind: 'add' })}
                >
                  Add batch
                </Button>
              }
            />
          )
        }
        mobileCard={(row) => (
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="tabular text-fg font-medium">{row.batchNumber}</p>
              <MedicineLink batch={row} className="text-fg-muted block truncate text-sm" />
              <p className="tabular text-fg-muted mt-2 text-xs">
                Received {formatDate(row.receivedDate)} · Expires {formatDate(row.expiryDate)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <BatchQuantity batch={row} />
              <ExpiryBadge status={row.status} daysLeft={row.daysLeft} size="sm" />
            </div>
            <div className="-mt-1 -mr-2">
              <BatchActions batch={row} {...handlers} />
            </div>
          </div>
        )}
      />
      <AddBatchDialog open={dialog.kind === 'add'} onOpenChange={closeDialog} onDone={onDone} />
      <ReceiveStockDialog
        open={dialog.kind === 'receive'}
        onOpenChange={closeDialog}
        batchId={dialog.batchId}
        medicineId={dialog.medicineId}
        onDone={onDone}
      />
      <AdjustStockDialog
        open={dialog.kind === 'adjust'}
        onOpenChange={closeDialog}
        batchId={dialog.batchId}
        medicineId={dialog.medicineId}
        onDone={onDone}
      />
      <BatchHistorySheet
        open={history.open}
        batchId={history.batchId}
        onOpenChange={(open) => setHistory((current) => ({ ...current, open }))}
        onReceive={(id) => openFromHistory('receive', id)}
        onAdjust={(id) => openFromHistory('adjust', id)}
      />
    </>
  );
}
