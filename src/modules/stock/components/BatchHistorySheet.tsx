import { useCallback } from 'react';
import { Link } from 'react-router';
import { ArrowDownToLine, SlidersHorizontal } from 'lucide-react';
import {
  selectBatchHistory,
  selectBatchViews,
  useInventory,
  type BatchHistoryRow,
  type ID,
  type InventoryState,
} from '@/data';
import { Badge, Button, ExpiryBadge, Sheet, TransactionTypeBadge } from '@/design-system';
import { formatDate, formatDateTime, formatNumber } from '@/shared/format';
import { ADJUSTMENT_REASON_LABEL } from '@/shared/labels';
import { links } from '@/shared/routes';
import { SignedQuantity } from './SignedQuantity';

interface BatchHistorySheetProps {
  batchId: ID | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReceive: (batchId: ID) => void;
  onAdjust: (batchId: ID) => void;
}

function HistoryItem({ row }: { row: BatchHistoryRow }) {
  const reason = row.reason ? ADJUSTMENT_REASON_LABEL[row.reason] : undefined;
  return (
    <li className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        {row.kind === 'OPENING' ? (
          <Badge tone="neutral">Opening balance</Badge>
        ) : (
          <TransactionTypeBadge type={row.kind} />
        )}
        <p className="tabular text-fg-muted mt-1.5 text-xs">
          {row.date ? formatDateTime(row.date) : '—'}
        </p>
        {(reason || row.remarks) && (
          <p className="text-fg-muted mt-1 text-sm">
            {reason && <span className="text-fg">{reason}</span>}
            {reason && row.remarks && ' · '}
            {row.remarks}
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        {row.kind === 'OPENING' ? (
          <span className="tabular text-fg text-sm font-medium">
            {formatNumber(row.quantityChange)}
          </span>
        ) : (
          <SignedQuantity value={row.quantityChange} />
        )}
        <span className="tabular text-fg-muted text-xs">
          Balance {formatNumber(row.quantityAfter)}
        </span>
      </div>
    </li>
  );
}

export function BatchHistorySheet({
  batchId,
  open,
  onOpenChange,
  onReceive,
  onAdjust,
}: BatchHistorySheetProps) {
  const id = batchId ?? '';
  const selectHistory = useCallback((state: InventoryState) => selectBatchHistory(state, id), [id]);
  const history = useInventory(selectHistory);
  const batches = useInventory(selectBatchViews);
  const batch = batches.find((view) => view.id === id);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={batch ? `Batch ${batch.batchNumber}` : 'Batch history'}
      description={batch ? batch.medicine.name : 'Every change to this batch, oldest first.'}
      footer={
        batch && (
          <>
            <Button
              variant="secondary"
              leadingIcon={<SlidersHorizontal className="size-4" />}
              onClick={() => onAdjust(batch.id)}
            >
              Adjust
            </Button>
            <Button
              leadingIcon={<ArrowDownToLine className="size-4" />}
              disabled={!batch.isUsable}
              onClick={() => onReceive(batch.id)}
            >
              Receive stock
            </Button>
          </>
        )
      }
    >
      {batch && (
        <div className="flex flex-col gap-6">
          <dl className="border-border-subtle grid grid-cols-2 gap-x-4 gap-y-4 rounded-md border p-4 text-sm">
            <div className="col-span-2 flex items-center justify-between gap-3">
              <dt className="sr-only">Status</dt>
              <dd>
                <ExpiryBadge status={batch.status} daysLeft={batch.daysLeft} />
              </dd>
              <dd>
                <Link
                  to={links.medicine(batch.medicineId)}
                  className="focus-ring text-primary link-underline rounded-sm text-sm"
                >
                  View medicine
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-fg-muted text-xs">On hand</dt>
              <dd
                className={
                  batch.isUsable
                    ? 'tabular text-fg mt-0.5 text-lg font-semibold'
                    : 'tabular text-danger mt-0.5 text-lg font-semibold'
                }
              >
                {formatNumber(batch.quantity)}
                {!batch.isUsable && (
                  <span className="text-fg-muted ml-1.5 text-xs font-normal">
                    expired, not usable
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-fg-muted text-xs">Opening balance</dt>
              <dd className="tabular text-fg mt-0.5 text-lg font-semibold">
                {formatNumber(batch.openingQuantity)}
              </dd>
            </div>
            <div>
              <dt className="text-fg-muted text-xs">Received</dt>
              <dd className="tabular text-fg mt-0.5">{formatDate(batch.receivedDate)}</dd>
            </div>
            <div>
              <dt className="text-fg-muted text-xs">Expiry</dt>
              <dd className="tabular text-fg mt-0.5">{formatDate(batch.expiryDate)}</dd>
            </div>
          </dl>
          <section aria-labelledby="batch-history-heading">
            <h3 id="batch-history-heading" className="text-fg text-sm font-semibold">
              History
            </h3>
            {history.length === 0 ? (
              <p className="text-fg-muted mt-2 text-sm">
                No movements recorded for this batch yet.
              </p>
            ) : (
              <ol className="divide-border-subtle mt-1 divide-y">
                {history.map((row) => (
                  <HistoryItem key={row.id} row={row} />
                ))}
              </ol>
            )}
          </section>
        </div>
      )}
    </Sheet>
  );
}
