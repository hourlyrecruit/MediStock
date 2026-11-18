import { Link } from 'react-router';
import { ShieldCheck } from 'lucide-react';
import { EmptyState, ExpiryBadge, buttonBase, buttonSizes, buttonVariants } from '@/design-system';
import { cn } from '@/shared/cn';
import { formatDate, formatNumber } from '@/shared/format';
import { links } from '@/shared/routes';
import { DASHBOARD_TABLE_LIMIT, useSettings, useUpcomingExpiries } from '../hooks/useDashboardData';
import { TileShell } from './TileShell';

const th = 'pb-2 text-left text-xs font-medium text-fg-muted';
const td = 'py-3 align-middle';

export function ExpiryTile() {
  const upcoming = useUpcomingExpiries();
  const { expiryAlertDays } = useSettings();
  const rows = upcoming.slice(0, DASHBOARD_TABLE_LIMIT);

  return (
    <TileShell
      title="Upcoming expiries"
      description={
        upcoming.length > 0
          ? `${formatNumber(upcoming.length)} ${upcoming.length === 1 ? 'batch expires' : 'batches expire'} within ${expiryAlertDays} days, soonest first`
          : `Batches expiring within ${expiryAlertDays} days`
      }
      viewAllHref={links.expiry({ status: 'expiring-soon' })}
      viewAllLabel="View all expiring batches"
    >
      {(headingId) =>
        rows.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="Nothing expiring soon"
            description={`No batch with stock expires in the next ${expiryAlertDays} days.`}
            className="py-10"
            action={
              <Link
                to={links.expiry()}
                className={cn(buttonBase, buttonVariants.secondary, buttonSizes.sm)}
              >
                Open expiry tracker
              </Link>
            }
          />
        ) : (
          <table aria-labelledby={headingId} className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr className="border-border-subtle border-b">
                <th scope="col" className={th}>
                  Medicine and batch
                </th>
                <th scope="col" className={cn(th, 'w-16 pl-4 text-right')}>
                  Qty
                </th>
                <th scope="col" className={cn(th, 'hidden w-52 pl-4 sm:table-cell')}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((batch) => (
                <tr key={batch.id} className="border-border-subtle border-b last:border-b-0">
                  <td className={td}>
                    <Link
                      to={links.medicine(batch.medicineId, { tab: 'batches' })}
                      className="focus-ring text-fg hover:text-primary link-underline block truncate rounded-sm font-medium"
                    >
                      {batch.medicine.name}
                    </Link>
                    <span className="tabular text-fg-muted mt-0.5 block truncate text-xs">
                      {batch.batchNumber} · {formatDate(batch.expiryDate)}
                    </span>
                    <ExpiryBadge
                      status={batch.status}
                      daysLeft={batch.daysLeft}
                      size="sm"
                      className="mt-1.5 sm:hidden"
                    />
                  </td>
                  <td className={cn(td, 'tabular text-fg pl-4 text-right font-medium')}>
                    {formatNumber(batch.quantity)}
                  </td>
                  <td className={cn(td, 'hidden pl-4 sm:table-cell')}>
                    <ExpiryBadge status={batch.status} daysLeft={batch.daysLeft} />
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
