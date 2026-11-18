import { Suspense, lazy } from 'react';
import { InView } from '@/design-system';
import { formatNumber } from '@/shared/format';
import { useCategoryDistribution, useMonthlyAdditions } from '../hooks/useDashboardData';
import { toDonutSlices } from '../lib/categorySlices';
import { TileShell } from './TileShell';

const CategoryDonut = lazy(() =>
  import('./charts/DashboardCharts').then((mod) => ({ default: mod.CategoryDonut })),
);
const MonthlyAdditionsChart = lazy(() =>
  import('./charts/DashboardCharts').then((mod) => ({ default: mod.MonthlyAdditionsChart })),
);

function DonutSkeleton() {
  return (
    <div aria-hidden className="grid size-full place-items-center">
      <div className="skeleton aspect-square h-full rounded-full" />
    </div>
  );
}

function BarsSkeleton() {
  return (
    <div aria-hidden className="flex size-full items-end gap-4 px-12 pb-6">
      {[45, 70, 55, 85, 60, 75].map((height) => (
        <div key={height} className="skeleton w-full rounded-sm" style={{ height: `${height}%` }} />
      ))}
    </div>
  );
}

export function CategoryTile() {
  const slices = toDonutSlices(useCategoryDistribution());
  const total = slices.reduce((sum, slice) => sum + slice.units, 0);

  return (
    <TileShell
      title="Stock by category"
      description="Usable units per category, excluding expired stock"
    >
      {() => (
        <div className="flex w-full min-w-0 flex-1 flex-col items-center gap-6 sm:flex-row sm:items-center">
          <div className="relative size-44 shrink-0">
            <InView className="size-full" fallback={<DonutSkeleton />}>
              <Suspense fallback={<DonutSkeleton />}>
                <div aria-hidden inert className="size-full">
                  <CategoryDonut slices={slices} />
                </div>
              </Suspense>
            </InView>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="tabular text-fg text-xl font-semibold">{formatNumber(total)}</p>
                <p className="text-fg-muted text-xs">usable units</p>
              </div>
            </div>
          </div>
          <ul
            className="grid w-full min-w-0 flex-1 grid-cols-[minmax(0,1fr)] gap-2 sm:w-auto"
            aria-label="Usable units by category"
          >
            {slices.map((slice) => (
              <li key={slice.key} className="flex min-w-0 items-center gap-2 text-sm">
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: slice.color }}
                />
                <span className="text-fg-muted min-w-0 flex-1 truncate">{slice.label}</span>
                <span className="tabular text-fg font-medium">{formatNumber(slice.units)}</span>
                <span className="tabular text-fg-faint w-10 text-right text-xs">
                  {total > 0 ? `${Math.round((slice.units / total) * 100)}%` : '0%'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </TileShell>
  );
}

export function MonthlyAdditionsTile() {
  const data = useMonthlyAdditions();
  const total = data.reduce((sum, month) => sum + month.units, 0);
  const peak = data.reduce<(typeof data)[number] | undefined>(
    (best, month) => (!best || month.units > best.units ? month : best),
    undefined,
  );

  return (
    <TileShell
      title="Monthly stock additions"
      description={
        <>
          <span className="tabular">{formatNumber(total)}</span> units received in the last 6 months
          {peak && peak.units > 0 ? (
            <>
              , peaking in {peak.label} at{' '}
              <span className="tabular">{formatNumber(peak.units)}</span>
            </>
          ) : null}
        </>
      }
    >
      {(headingId) => (
        <>
          <div className="h-56 w-full" aria-hidden inert>
            <InView className="size-full" fallback={<BarsSkeleton />}>
              <Suspense fallback={<BarsSkeleton />}>
                <MonthlyAdditionsChart data={data} />
              </Suspense>
            </InView>
          </div>
          <table className="sr-only" aria-labelledby={headingId}>
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col">Units added</th>
              </tr>
            </thead>
            <tbody>
              {data.map((month) => (
                <tr key={month.month}>
                  <th scope="row">{month.label}</th>
                  <td>{formatNumber(month.units)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </TileShell>
  );
}
