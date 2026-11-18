import { Link } from 'react-router';
import { PackageCheck } from 'lucide-react';
import {
  EmptyState,
  StockLevelBar,
  buttonBase,
  buttonSizes,
  buttonVariants,
} from '@/design-system';
import { cn } from '@/shared/cn';
import { formatNumber } from '@/shared/format';
import { links } from '@/shared/routes';
import { DASHBOARD_TABLE_LIMIT, useLowStock } from '../hooks/useDashboardData';
import { TileShell } from './TileShell';

const th = 'pb-2 text-left text-xs font-medium text-fg-muted';
const td = 'py-3 align-middle';

export function LowStockTile() {
  const lowStock = useLowStock();
  const rows = lowStock.slice(0, DASHBOARD_TABLE_LIMIT);
  const more = lowStock.length - rows.length;

  return (
    <TileShell
      title="Low stock"
      description={
        lowStock.length > 0
          ? `${formatNumber(lowStock.length)} active ${lowStock.length === 1 ? 'medicine is' : 'medicines are'} below minimum${more > 0 ? `, showing the ${rows.length} largest shortfalls` : ''}`
          : 'Usable stock against each minimum level'
      }
      viewAllHref={links.lowStock()}
      viewAllLabel="View all low-stock medicines"
    >
      {(headingId) =>
        rows.length === 0 ? (
          <EmptyState
            icon={PackageCheck}
            title="Everything is stocked"
            description="Every active medicine is at or above its minimum level."
            className="py-10"
            action={
              <Link
                to={links.stock()}
                className={cn(buttonBase, buttonVariants.secondary, buttonSizes.sm)}
              >
                Open stock
              </Link>
            }
          />
        ) : (
          <table aria-labelledby={headingId} className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr className="border-border-subtle border-b">
                <th scope="col" className={cn(th, 'w-auto')}>
                  Medicine
                </th>
                <th scope="col" className={cn(th, 'hidden w-[32%] pl-4 sm:table-cell')}>
                  Usable vs minimum
                </th>
                <th scope="col" className={cn(th, 'w-24 pl-4 text-right')}>
                  Shortfall
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((medicine) => (
                <tr key={medicine.id} className="border-border-subtle border-b last:border-b-0">
                  <td className={td}>
                    <Link
                      to={links.medicine(medicine.id)}
                      className="focus-ring text-fg hover:text-primary link-underline block truncate rounded-sm font-medium"
                    >
                      {medicine.name}
                    </Link>
                    <span className="tabular text-fg-muted mt-0.5 block truncate text-xs">
                      {formatNumber(medicine.stock.usable)} of{' '}
                      {formatNumber(medicine.minStockLevel)} min
                      <span className="max-sm:hidden"> · {medicine.genericName}</span>
                    </span>
                  </td>
                  <td className={cn(td, 'hidden pl-4 sm:table-cell')}>
                    <StockLevelBar
                      stock={medicine.stock.usable}
                      minStockLevel={medicine.minStockLevel}
                      label={`${medicine.name} usable stock`}
                    />
                  </td>
                  <td className={cn(td, 'tabular text-fg pl-4 text-right font-medium')}>
                    −{formatNumber(medicine.shortfall)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      }
    </TileShell>
  );
}
