import { History } from 'lucide-react';
import { Badge, EmptyState, Sheet, TransactionTypeBadge } from '@/design-system';
import type { BatchHistoryRow, ID } from '@/data';
import { formatDateTime, formatNumber, formatSigned } from '@/shared/format';
import { ADJUSTMENT_REASON_LABEL } from '@/shared/labels';
import { useBatchHistory, useBatchNumber } from '../hooks/useMedicineData';

interface BatchHistorySheetProps {
  batchId: ID | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function HistoryRow({ row }: { row: BatchHistoryRow }) {
  const note = [row.reason ? ADJUSTMENT_REASON_LABEL[row.reason] : undefined, row.remarks]
    .filter(Boolean)
    .join(' · ');
  return (
    <li className="flex items-start justify-between gap-4 py-3">
      <div className="flex min-w-0 flex-col gap-1">
        {row.kind === 'OPENING' ? (
          <Badge tone="neutral" icon={History} size="sm">
            Opening balance
          </Badge>
        ) : (
          <TransactionTypeBadge type={row.kind} size="sm" />
        )}
        <span className="text-fg-muted text-xs">{row.date ? formatDateTime(row.date) : '—'}</span>
        {note && <span className="text-fg-muted text-xs">{note}</span>}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="tabular text-fg text-sm font-medium">
          {formatSigned(row.quantityChange)}
        </span>
        <span className="tabular text-fg-muted text-xs">
          {formatNumber(row.quantityAfter)} after
        </span>
      </div>
    </li>
  );
}

export function BatchHistorySheet({ batchId, open, onOpenChange }: BatchHistorySheetProps) {
  const rows = useBatchHistory(batchId);
  const batchNumber = useBatchNumber(batchId);
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={batchNumber ? `Batch ${batchNumber}` : 'Batch history'}
      description="Opening balance and every movement, oldest first."
      size="sm"
    >
      {rows.length === 0 ? (
        <EmptyState
          icon={History}
          title="No history yet"
          description="Movements on this batch will appear here."
        />
      ) : (
        <ol aria-label="Batch history" className="divide-border-subtle flex flex-col divide-y">
          {rows.map((row) => (
            <HistoryRow key={row.id} row={row} />
          ))}
        </ol>
      )}
    </Sheet>
  );
}
