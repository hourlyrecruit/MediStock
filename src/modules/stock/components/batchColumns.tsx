import { Link } from 'react-router';
import type { BatchView } from '@/data';
import { ExpiryBadge, type ColumnDef } from '@/design-system';
import { cn } from '@/shared/cn';
import { formatDate, formatNumber } from '@/shared/format';
import { links } from '@/shared/routes';
import { BatchActions, type BatchActionHandlers } from './BatchActions';

export function BatchQuantity({ batch }: { batch: BatchView }) {
  if (!batch.isUsable) {
    return (
      <span className="inline-flex items-baseline gap-1.5">
        <span className="tabular text-danger decoration-danger/50 line-through">
          {formatNumber(batch.quantity)}
        </span>
        <span className="text-fg-muted text-xs">expired</span>
      </span>
    );
  }
  return (
    <span className={cn('tabular', batch.quantity === 0 ? 'text-fg-faint' : 'text-fg font-medium')}>
      {formatNumber(batch.quantity)}
    </span>
  );
}

export function MedicineLink({ batch, className }: { batch: BatchView; className?: string }) {
  return (
    <Link
      to={links.medicine(batch.medicineId)}
      className={cn('focus-ring text-fg link-underline hover:text-primary rounded-sm', className)}
    >
      {batch.medicine.name}
    </Link>
  );
}

export function buildBatchColumns(handlers: BatchActionHandlers): ColumnDef<BatchView>[] {
  return [
    {
      id: 'batch',
      header: 'Batch no.',
      cell: (row) => (
        <span className="tabular font-medium whitespace-nowrap">{row.batchNumber}</span>
      ),
      sortValue: (row) => row.batchNumber,
      searchValue: (row) => row.batchNumber,
    },
    {
      id: 'medicine',
      header: 'Medicine',
      cell: (row) => <MedicineLink batch={row} />,
      sortValue: (row) => row.medicine.name,
      searchValue: (row) => [row.medicine.name, row.medicine.genericName],
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
      cell: (row) => <BatchQuantity batch={row} />,
      sortValue: (row) => row.quantity,
    },
    {
      id: 'received',
      header: 'Received',
      cell: (row) => <span className="tabular text-fg-muted">{formatDate(row.receivedDate)}</span>,
      sortValue: (row) => row.receivedDate,
    },
    {
      id: 'expiry',
      header: 'Expiry',
      cell: (row) => <span className="tabular">{formatDate(row.expiryDate)}</span>,
      sortValue: (row) => row.expiryDate,
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '64px',
      cell: (row) => <BatchActions batch={row} {...handlers} />,
    },
  ];
}
