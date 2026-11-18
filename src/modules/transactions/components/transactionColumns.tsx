import { Link } from 'react-router';
import type { TransactionView } from '@/data';
import { TransactionTypeBadge, type ColumnDef } from '@/design-system';
import { cn } from '@/shared/cn';
import { formatDateTime, formatNumber } from '@/shared/format';
import { ADJUSTMENT_REASON_LABEL } from '@/shared/labels';
import { links } from '@/shared/routes';

export function signedText(value: number) {
  if (value > 0) return `+${formatNumber(value)}`;
  if (value < 0) return `−${formatNumber(-value)}`;
  return formatNumber(0);
}

export function QuantityChange({ value, className }: { value: number; className?: string }) {
  return (
    <span
      className={cn(
        'tabular font-medium',
        value > 0 ? 'text-success' : value < 0 ? 'text-danger' : 'text-fg-muted',
        className,
      )}
    >
      {signedText(value)}
    </span>
  );
}

export function TransactionNote({ row, className }: { row: TransactionView; className?: string }) {
  const reason = row.reason ? ADJUSTMENT_REASON_LABEL[row.reason] : undefined;
  if (!reason && !row.remarks) return <span className={cn('text-fg-faint', className)}>—</span>;
  return (
    <span className={cn('text-fg-muted', className)}>
      {reason && <span className="text-fg">{reason}</span>}
      {reason && row.remarks && ' · '}
      {row.remarks}
    </span>
  );
}

export function MedicineLink({ row, className }: { row: TransactionView; className?: string }) {
  return (
    <Link
      to={links.medicine(row.medicineId)}
      className={cn('focus-ring text-fg link-underline hover:text-primary rounded-sm', className)}
    >
      {row.medicineName}
    </Link>
  );
}

export const transactionColumns: ColumnDef<TransactionView>[] = [
  {
    id: 'date',
    header: 'Date',
    cell: (row) => (
      <span className="tabular text-fg-muted whitespace-nowrap">{formatDateTime(row.date)}</span>
    ),
    sortValue: (row) => row.date,
  },
  {
    id: 'medicine',
    header: 'Medicine',
    cell: (row) => <MedicineLink row={row} />,
    sortValue: (row) => row.medicineName,
    searchValue: (row) => row.medicineName,
  },
  {
    id: 'batch',
    header: 'Batch no.',
    cell: (row) => <span className="tabular whitespace-nowrap">{row.batchNumber}</span>,
    sortValue: (row) => row.batchNumber,
    searchValue: (row) => row.batchNumber,
  },
  {
    id: 'type',
    header: 'Type',
    cell: (row) => <TransactionTypeBadge type={row.type} />,
    sortValue: (row) => row.type,
  },
  {
    id: 'change',
    header: 'Change',
    align: 'right',
    cell: (row) => <QuantityChange value={row.quantityChange} />,
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
    className: 'max-w-72',
    cell: (row) => <TransactionNote row={row} className="line-clamp-2" />,
    searchValue: (row) => [
      row.remarks,
      row.reason ? ADJUSTMENT_REASON_LABEL[row.reason] : undefined,
    ],
  },
];
