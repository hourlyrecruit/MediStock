import { ArrowLeftRight } from 'lucide-react';
import { DataTableView, EmptyState, TransactionTypeBadge, type ColumnDef } from '@/design-system';
import type { MedicineView, TransactionView } from '@/data';
import { formatDateTime, formatNumber, formatSigned } from '@/shared/format';
import { ADJUSTMENT_REASON_LABEL } from '@/shared/labels';
import { useLocalTableState } from '../hooks/useLocalTableState';
import { useMedicineTransactions } from '../hooks/useMedicineData';

function noteFor(tx: TransactionView) {
  return [tx.reason ? ADJUSTMENT_REASON_LABEL[tx.reason] : undefined, tx.remarks]
    .filter(Boolean)
    .join(' · ');
}

const columns: ColumnDef<TransactionView>[] = [
  {
    id: 'date',
    header: 'Date',
    cell: (row) => <span className="tabular whitespace-nowrap">{formatDateTime(row.date)}</span>,
    sortValue: (row) => row.date,
  },
  {
    id: 'type',
    header: 'Type',
    cell: (row) => <TransactionTypeBadge type={row.type} />,
    sortValue: (row) => row.type,
  },
  {
    id: 'batch',
    header: 'Batch',
    cell: (row) => <span className="font-medium">{row.batchNumber}</span>,
    sortValue: (row) => row.batchNumber,
  },
  {
    id: 'change',
    header: 'Change',
    align: 'right',
    cell: (row) => formatSigned(row.quantityChange),
    sortValue: (row) => row.quantityChange,
  },
  {
    id: 'after',
    header: 'Qty after',
    align: 'right',
    cell: (row) => formatNumber(row.quantityAfter),
    sortValue: (row) => row.quantityAfter,
  },
  {
    id: 'note',
    header: 'Reason / remarks',
    cell: (row) => <span className="text-fg-muted">{noteFor(row) || '—'}</span>,
  },
];

function TransactionCard({ tx }: { tx: TransactionView }) {
  const note = noteFor(tx);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <TransactionTypeBadge type={tx.type} size="sm" />
        <span className="tabular text-fg text-sm font-medium">
          {formatSigned(tx.quantityChange)}
        </span>
      </div>
      <div className="text-fg-muted flex items-center justify-between gap-3 text-xs">
        <span className="truncate">
          Batch <span className="text-fg font-medium">{tx.batchNumber}</span> ·{' '}
          {formatDateTime(tx.date)}
        </span>
        <span className="tabular shrink-0">{formatNumber(tx.quantityAfter)} after</span>
      </div>
      {note && <p className="text-fg-muted text-xs">{note}</p>}
    </div>
  );
}

export function TransactionsTab({ medicine }: { medicine: MedicineView }) {
  const transactions = useMedicineTransactions(medicine.id);
  const [tableState, setTableState] = useLocalTableState();

  if (transactions.length === 0) {
    return (
      <div className="card">
        <EmptyState
          icon={ArrowLeftRight}
          title="No stock movements yet"
          description="Batches, receipts and adjustments for this medicine will be logged here."
        />
      </div>
    );
  }

  return (
    <DataTableView
      rows={transactions}
      columns={columns}
      getRowId={(row) => row.id}
      caption={`Transactions for ${medicine.name}`}
      state={tableState}
      onStateChange={setTableState}
      itemLabel="transactions"
      mobileCard={(row) => <TransactionCard tx={row} />}
    />
  );
}
