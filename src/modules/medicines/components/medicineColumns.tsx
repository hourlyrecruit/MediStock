import { m } from 'framer-motion';
import { springs, StockLevelBar, type ColumnDef } from '@/design-system';
import type { MedicineView } from '@/data';
import { formatDate, formatINR, formatNumber } from '@/shared/format';
import { LowStockBadge, MedicineStatusBadge } from './MedicineStatusBadge';

export function medicineLayoutId(id: string) {
  return `medicine-${id}`;
}

function MedicineName({ medicine }: { medicine: MedicineView }) {
  return (
    <div className="min-w-0">
      <m.span
        layoutId={medicineLayoutId(medicine.id)}
        transition={springs.smooth}
        className="text-fg block w-fit max-w-full truncate font-medium"
      >
        {medicine.name}
      </m.span>
      <span className="text-fg-muted block truncate text-xs">{medicine.genericName}</span>
    </div>
  );
}

function StockCell({ medicine }: { medicine: MedicineView }) {
  return (
    <div className="flex min-w-44 flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="tabular text-fg whitespace-nowrap">
          {formatNumber(medicine.stock.usable)}
          <span className="text-fg-muted"> / {formatNumber(medicine.minStockLevel)} min</span>
        </span>
        {medicine.isLowStock && <LowStockBadge />}
      </div>
      <StockLevelBar
        stock={medicine.stock.usable}
        minStockLevel={medicine.minStockLevel}
        label={`Usable stock for ${medicine.name}`}
      />
    </div>
  );
}

export const medicineColumns: ColumnDef<MedicineView>[] = [
  {
    id: 'name',
    header: 'Medicine',
    cell: (row) => <MedicineName medicine={row} />,
    sortValue: (row) => row.name,
    searchValue: (row) => [row.name, row.genericName],
    width: '24%',
  },
  {
    id: 'category',
    header: 'Category',
    cell: (row) => <span className="text-fg-muted">{row.category}</span>,
    sortValue: (row) => row.category,
  },
  {
    id: 'manufacturer',
    header: 'Manufacturer',
    hideBelowXl: true,
    cell: (row) => <span className="text-fg-muted">{row.manufacturer}</span>,
    sortValue: (row) => row.manufacturer,
  },
  {
    id: 'price',
    header: 'Unit price',
    align: 'right',
    cell: (row) => formatINR(row.unitPrice),
    sortValue: (row) => row.unitPrice,
  },
  {
    id: 'stock',
    header: 'Usable stock',
    cell: (row) => <StockCell medicine={row} />,
    sortValue: (row) => row.stock.usable,
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <MedicineStatusBadge isActive={row.isActive} />,
    sortValue: (row) => (row.isActive ? 0 : 1),
  },
  {
    id: 'expiry',
    header: 'Next expiry',
    cell: (row) =>
      row.stock.nextExpiry ? (
        <span className="tabular whitespace-nowrap">{formatDate(row.stock.nextExpiry)}</span>
      ) : (
        <span className="text-fg-faint">—</span>
      ),
    sortValue: (row) => row.stock.nextExpiry,
  },
];

export function MedicineCard({ medicine }: { medicine: MedicineView }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <MedicineName medicine={medicine} />
        <MedicineStatusBadge isActive={medicine.isActive} size="sm" />
      </div>
      <div className="text-fg-muted flex items-center justify-between gap-3 text-xs">
        <span className="truncate">{medicine.category}</span>
        <span className="tabular text-fg">{formatINR(medicine.unitPrice)}</span>
      </div>
      <StockCell medicine={medicine} />
      {medicine.stock.nextExpiry && (
        <p className="text-fg-muted text-xs">
          Next expiry{' '}
          <span className="tabular text-fg">{formatDate(medicine.stock.nextExpiry)}</span>
        </p>
      )}
    </div>
  );
}
