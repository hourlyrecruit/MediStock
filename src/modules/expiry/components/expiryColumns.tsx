import { Link } from 'react-router';
import { ExpiryBadge, type ColumnDef } from '@/design-system';
import type { BatchView } from '@/data';
import { cn } from '@/shared/cn';
import { formatDate, formatINR, formatNumber } from '@/shared/format';
import { links } from '@/shared/routes';
import { ExpiryRowActions, type ExpiryAction } from './ExpiryRowActions';

export function valueAtRisk(batch: BatchView) {
  return batch.quantity * batch.medicine.unitPrice;
}

function daysText(daysLeft: number) {
  if (daysLeft === 0) return 'Today';
  const count = Math.abs(daysLeft);
  const unit = count === 1 ? 'day' : 'days';
  return daysLeft < 0 ? `${count} ${unit} ago` : `${count} ${unit} left`;
}

function daysLeftClass(batch: BatchView) {
  if (batch.status === 'EXPIRED') return 'text-danger';
  if (batch.status === 'EXPIRES_TODAY') return 'text-urgent';
  return 'text-fg-muted';
}

function MedicineCell({ batch }: { batch: BatchView }) {
  return (
    <div className="min-w-0">
      <Link
        to={links.medicine(batch.medicineId)}
        className="focus-ring text-fg link-underline block truncate rounded-sm font-medium"
      >
        {batch.medicine.name}
      </Link>
      <p className="text-fg-muted truncate text-xs">{batch.medicine.genericName}</p>
    </div>
  );
}

const COMPACT = new Set(['batch', 'status', 'days', 'expiry', 'quantity', 'value']);

function compact(column: ColumnDef<BatchView>): ColumnDef<BatchView> {
  if (!COMPACT.has(column.id)) return column;
  return {
    ...column,
    className: cn('px-3', column.className),
    headerClassName: cn('px-3', column.headerClassName),
  };
}

export function buildExpiryColumns(
  onAction: (action: ExpiryAction) => void,
): ColumnDef<BatchView>[] {
  const columns: ColumnDef<BatchView>[] = [
    {
      id: 'medicine',
      header: 'Medicine',
      cell: (row) => <MedicineCell batch={row} />,
      sortValue: (row) => row.medicine.name,
      searchValue: (row) => [row.medicine.name, row.medicine.genericName, row.batchNumber],
      className: 'max-w-64',
    },
    {
      id: 'batch',
      header: 'Batch no.',
      cell: (row) => (
        <span className="tabular text-fg-muted whitespace-nowrap">{row.batchNumber}</span>
      ),
      sortValue: (row) => row.batchNumber,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <ExpiryBadge status={row.status} />,
      sortValue: (row) => row.daysLeft,
    },
    {
      id: 'days',
      header: 'Days left',
      hideBelowXl: true,
      align: 'right',
      cell: (row) => (
        <span className={cn('whitespace-nowrap', daysLeftClass(row))}>
          {daysText(row.daysLeft)}
        </span>
      ),
      sortValue: (row) => row.daysLeft,
    },
    {
      id: 'expiry',
      header: 'Expiry date',
      cell: (row) => (
        <span className="tabular whitespace-nowrap">{formatDate(row.expiryDate)}</span>
      ),
      sortValue: (row) => row.expiryDate,
    },
    {
      id: 'quantity',
      header: 'Qty',
      align: 'right',
      cell: (row) => formatNumber(row.quantity),
      sortValue: (row) => row.quantity,
    },
    {
      id: 'value',
      header: 'Value at risk',
      align: 'right',
      cell: (row) => <span className="whitespace-nowrap">{formatINR(valueAtRisk(row))}</span>,
      sortValue: valueAtRisk,
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      cell: (row) => <ExpiryRowActions batch={row} onAction={onAction} />,
    },
  ];
  return columns.map(compact);
}

export function ExpiryMobileCard({
  batch,
  onAction,
}: {
  batch: BatchView;
  onAction: (action: ExpiryAction) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <MedicineCell batch={batch} />
        <ExpiryBadge status={batch.status} size="sm" />
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <dt className="text-fg-muted">Batch</dt>
        <dd className="tabular text-right">{batch.batchNumber}</dd>
        <dt className="text-fg-muted">Expiry</dt>
        <dd className="tabular text-right">{formatDate(batch.expiryDate)}</dd>
        <dt className="text-fg-muted">Days left</dt>
        <dd className={cn('text-right', daysLeftClass(batch))}>{daysText(batch.daysLeft)}</dd>
        <dt className="text-fg-muted">Quantity</dt>
        <dd className="tabular text-right">{formatNumber(batch.quantity)}</dd>
        <dt className="text-fg-muted">Value at risk</dt>
        <dd className="tabular text-right">{formatINR(valueAtRisk(batch))}</dd>
      </dl>
      <ExpiryRowActions batch={batch} onAction={onAction} />
    </div>
  );
}
