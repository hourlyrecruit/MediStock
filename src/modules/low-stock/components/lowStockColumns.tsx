import { Link } from 'react-router';
import { Badge, StockLevelBar, type ColumnDef } from '@/design-system';
import type { MedicineView } from '@/data';
import { cn } from '@/shared/cn';
import { formatDate, formatNumber } from '@/shared/format';
import { links } from '@/shared/routes';
import { LowStockRowActions, type LowStockAction } from './LowStockRowActions';
import { SeverityBadge } from './SeverityBadge';

function MedicineCell({ view }: { view: MedicineView }) {
  return (
    <div className="max-w-44 min-w-0 max-md:max-w-none">
      <Link
        to={links.medicine(view.id)}
        className="focus-ring text-fg link-underline block truncate rounded-sm font-medium"
      >
        {view.name}
      </Link>
      <p className="text-fg-muted truncate text-xs">
        {view.genericName} · {view.category}
      </p>
    </div>
  );
}

function LevelCell({ view }: { view: MedicineView }) {
  return (
    <div className="flex w-40 flex-col gap-1.5 max-md:w-full">
      <span className="tabular text-sm">
        <span className="text-fg font-medium">{formatNumber(view.stock.usable)}</span>
        <span className="text-fg-muted"> / {formatNumber(view.minStockLevel)} min</span>
      </span>
      <StockLevelBar
        stock={view.stock.usable}
        minStockLevel={view.minStockLevel}
        label={`${view.name} usable stock`}
      />
      {view.stock.expired > 0 && (
        <Badge
          tone="neutral"
          size="sm"
          className="self-start"
          title="Expired units are not counted as usable"
        >
          <span className="tabular">{formatNumber(view.stock.expired)}</span> expired · not usable
        </Badge>
      )}
    </div>
  );
}

function nextExpiryText(view: MedicineView) {
  return view.stock.nextExpiry ? formatDate(view.stock.nextExpiry) : '—';
}

const COMPACT = new Set(['severity', 'usable', 'shortfall', 'next-expiry']);

function compact(column: ColumnDef<MedicineView>): ColumnDef<MedicineView> {
  if (!COMPACT.has(column.id)) return column;
  return {
    ...column,
    className: cn('px-3', column.className),
    headerClassName: cn('px-3', column.headerClassName),
  };
}

export function buildLowStockColumns(
  onAction: (action: LowStockAction) => void,
): ColumnDef<MedicineView>[] {
  const columns: ColumnDef<MedicineView>[] = [
    {
      id: 'medicine',
      header: 'Medicine',
      cell: (row) => <MedicineCell view={row} />,
      sortValue: (row) => row.name,
      searchValue: (row) => [row.name, row.genericName],
      className: 'max-w-56',
    },
    {
      id: 'severity',
      header: 'Status',
      cell: (row) => <SeverityBadge view={row} />,
      sortValue: (row) => row.stock.usable,
    },
    {
      id: 'usable',
      header: 'Usable vs minimum',
      cell: (row) => <LevelCell view={row} />,
      sortValue: (row) => row.stock.usable,
    },
    {
      id: 'shortfall',
      header: 'Shortfall',
      align: 'right',
      cell: (row) => <span className="font-medium">{formatNumber(row.shortfall)}</span>,
      sortValue: (row) => row.shortfall,
    },
    {
      id: 'next-expiry',
      header: 'Next expiry',
      hideBelowXl: true,
      cell: (row) => <span className="tabular whitespace-nowrap">{nextExpiryText(row)}</span>,
      sortValue: (row) => row.stock.nextExpiry,
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      cell: (row) => <LowStockRowActions medicine={row} onAction={onAction} />,
    },
  ];
  return columns.map(compact);
}

export function LowStockMobileCard({
  view,
  onAction,
}: {
  view: MedicineView;
  onAction: (action: LowStockAction) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <MedicineCell view={view} />
        <SeverityBadge view={view} size="sm" />
      </div>
      <LevelCell view={view} />
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <dt className="text-fg-muted">Shortfall</dt>
        <dd className="tabular text-right font-medium">{formatNumber(view.shortfall)}</dd>
        <dt className="text-fg-muted">Next expiry</dt>
        <dd className="tabular text-right">{nextExpiryText(view)}</dd>
      </dl>
      <LowStockRowActions medicine={view} onAction={onAction} className="justify-start" />
    </div>
  );
}
