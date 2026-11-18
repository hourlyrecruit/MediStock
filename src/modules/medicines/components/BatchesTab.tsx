import { useMemo, useState } from 'react';
import { ArrowDownToLine, History, PackageOpen, Plus, SlidersHorizontal } from 'lucide-react';
import { Button, DataTableView, EmptyState, ExpiryBadge, type ColumnDef } from '@/design-system';
import type { BatchView, ID, MedicineView } from '@/data';
import { AdjustStockDialog, ReceiveStockDialog } from '@/modules/stock';
import { formatDate, formatNumber } from '@/shared/format';
import { useLocalTableState } from '../hooks/useLocalTableState';
import { useMedicineBatches } from '../hooks/useMedicineData';
import { BatchHistorySheet } from './BatchHistorySheet';
import { GuardedButton } from './GuardedButton';

type BatchDialog = 'receive' | 'adjust' | 'history';

interface BatchActionsProps {
  batch: BatchView;
  onOpen: (kind: BatchDialog, batchId: ID) => void;
}

function BatchActions({ batch, onOpen }: BatchActionsProps) {
  const expired = batch.status === 'EXPIRED';
  return (
    <div className="flex flex-wrap items-center justify-end gap-1" data-row-ignore>
      <GuardedButton
        size="sm"
        variant="ghost"
        leadingIcon={<ArrowDownToLine className="size-4" />}
        blockedReason={expired ? 'Expired batches cannot receive stock' : undefined}
        onClick={() => onOpen('receive', batch.id)}
        aria-label={`Receive stock into batch ${batch.batchNumber}`}
      >
        Receive
      </GuardedButton>
      <Button
        size="sm"
        variant="ghost"
        leadingIcon={<SlidersHorizontal className="size-4" />}
        onClick={() => onOpen('adjust', batch.id)}
        aria-label={`Adjust stock of batch ${batch.batchNumber}`}
      >
        Adjust
      </Button>
      <Button
        size="sm"
        variant="ghost"
        leadingIcon={<History className="size-4" />}
        onClick={() => onOpen('history', batch.id)}
        aria-label={`History of batch ${batch.batchNumber}`}
      >
        History
      </Button>
    </div>
  );
}

function buildColumns(onOpen: BatchActionsProps['onOpen']): ColumnDef<BatchView>[] {
  return [
    {
      id: 'batch',
      header: 'Batch',
      cell: (row) => <span className="font-medium">{row.batchNumber}</span>,
      sortValue: (row) => row.batchNumber,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <ExpiryBadge status={row.status} daysLeft={row.daysLeft} />,
      sortValue: (row) => row.daysLeft,
    },
    {
      id: 'quantity',
      header: 'Quantity',
      align: 'right',
      cell: (row) => formatNumber(row.quantity),
      sortValue: (row) => row.quantity,
    },
    {
      id: 'received',
      header: 'Received',
      cell: (row) => (
        <span className="tabular whitespace-nowrap">{formatDate(row.receivedDate)}</span>
      ),
      sortValue: (row) => row.receivedDate,
    },
    {
      id: 'expiry',
      header: 'Expiry',
      cell: (row) => (
        <span className="tabular whitespace-nowrap">{formatDate(row.expiryDate)}</span>
      ),
      sortValue: (row) => row.expiryDate,
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      cell: (row) => <BatchActions batch={row} onOpen={onOpen} />,
    },
  ];
}

function BatchCard({ batch, onOpen }: BatchActionsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-fg truncate font-medium">{batch.batchNumber}</p>
          <p className="tabular text-fg-muted text-xs">
            Received {formatDate(batch.receivedDate)} · Expires {formatDate(batch.expiryDate)}
          </p>
        </div>
        <span className="tabular text-fg shrink-0 text-sm font-medium">
          {formatNumber(batch.quantity)}
        </span>
      </div>
      <ExpiryBadge
        status={batch.status}
        daysLeft={batch.daysLeft}
        size="sm"
        className="self-start"
      />
      <BatchActions batch={batch} onOpen={onOpen} />
    </div>
  );
}

interface BatchesTabProps {
  medicine: MedicineView;
  onAddBatch: () => void;
  canAddBatch: boolean;
}

export function BatchesTab({ medicine, onAddBatch, canAddBatch }: BatchesTabProps) {
  const batches = useMedicineBatches(medicine.id);
  const [showEmpty, setShowEmpty] = useState(false);
  const [tableState, setTableState] = useLocalTableState({ sort: 'expiry' });
  const [dialog, setDialog] = useState<{ kind: BatchDialog; batchId: ID; open: boolean } | null>(
    null,
  );

  const visible = useMemo(
    () => (showEmpty ? batches : batches.filter((batch) => batch.quantity > 0)),
    [batches, showEmpty],
  );
  const hiddenCount = batches.length - batches.filter((batch) => batch.quantity > 0).length;
  const columns = useMemo(
    () => buildColumns((kind, batchId) => setDialog({ kind, batchId, open: true })),
    [],
  );

  const close = (open: boolean) => {
    if (!open) setDialog((current) => (current ? { ...current, open: false } : current));
  };
  const isOpen = (kind: BatchDialog) => dialog?.kind === kind && dialog.open;
  const batchId = dialog?.batchId;

  if (batches.length === 0) {
    return (
      <div className="card">
        <EmptyState
          icon={PackageOpen}
          title="No batches yet"
          description={
            canAddBatch
              ? 'Add the first batch to start tracking stock for this medicine.'
              : 'Activate this medicine to add its first batch.'
          }
          action={
            canAddBatch ? (
              <Button leadingIcon={<Plus className="size-4" />} onClick={onAddBatch}>
                Add batch
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  return (
    <>
      <DataTableView
        rows={visible}
        columns={columns}
        getRowId={(row) => row.id}
        caption={`Batches of ${medicine.name}`}
        state={tableState}
        onStateChange={setTableState}
        itemLabel="batches"
        mobileCard={(row) => (
          <BatchCard
            batch={row}
            onOpen={(kind, id) => setDialog({ kind, batchId: id, open: true })}
          />
        )}
        filters={
          hiddenCount > 0 ? (
            <label className="text-fg-muted flex min-h-11 cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showEmpty}
                onChange={(event) => setShowEmpty(event.target.checked)}
                className="focus-ring accent-primary size-4 cursor-pointer rounded-sm"
              />
              Show empty batches ({hiddenCount})
            </label>
          ) : undefined
        }
        emptyState={
          <EmptyState
            icon={PackageOpen}
            title="Every batch is empty"
            description="Empty batches are hidden. Show them to see their history."
            action={
              <Button variant="secondary" onClick={() => setShowEmpty(true)}>
                Show empty batches
              </Button>
            }
          />
        }
      />
      <ReceiveStockDialog
        open={isOpen('receive')}
        onOpenChange={close}
        batchId={batchId}
        medicineId={medicine.id}
      />
      <AdjustStockDialog
        open={isOpen('adjust')}
        onOpenChange={close}
        batchId={batchId}
        medicineId={medicine.id}
      />
      <BatchHistorySheet
        batchId={dialog?.kind === 'history' ? batchId : undefined}
        open={isOpen('history')}
        onOpenChange={close}
      />
    </>
  );
}
