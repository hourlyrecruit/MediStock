import type { ReactNode } from 'react';
import { Boxes, CalendarClock, PackageX, Pill, TrendingDown, type LucideIcon } from 'lucide-react';
import { StatCard, StaggerItem, type StatCardProps } from '@/design-system';
import type { Kpis } from '@/data';
import { formatINR, formatNumber } from '@/shared/format';
import { links } from '@/shared/routes';

type Tone = NonNullable<StatCardProps['tone']>;

export interface KpiTile {
  key: string;
  label: string;
  value: number;
  subLabel: ReactNode;
  href: string;
  icon: LucideIcon;
  tone: Tone;
}

const plural = (count: number, word: string) =>
  `${formatNumber(count)} ${word}${count === 1 ? '' : 's'}`;

export function buildKpiTiles(kpis: Kpis, alertDays: number): KpiTile[] {
  return [
    {
      key: 'medicines',
      label: 'Total medicines',
      value: kpis.activeMedicines,
      subLabel: `active, of ${formatNumber(kpis.totalMedicines)} total`,
      href: links.medicines({ status: 'active' }),
      icon: Pill,
      tone: 'primary',
    },
    {
      key: 'usable-units',
      label: 'Usable units',
      value: kpis.usableUnits,
      subLabel: `worth ${formatINR(kpis.usableStockValue)}`,
      href: links.stock(),
      icon: Boxes,
      tone: 'primary',
    },
    {
      key: 'low-stock',
      label: 'Low stock',
      value: kpis.lowStockCount,
      subLabel: kpis.lowStockCount > 0 ? 'below minimum level' : 'all above minimum',
      href: links.lowStock(),
      icon: TrendingDown,
      tone: kpis.lowStockCount > 0 ? 'warning' : 'neutral',
    },
    {
      key: 'expiring-soon',
      label: 'Expiring soon',
      value: kpis.expiringSoonCount + kpis.expiresTodayCount,
      subLabel:
        kpis.expiresTodayCount > 0
          ? `incl. ${formatNumber(kpis.expiresTodayCount)} today`
          : `within ${plural(alertDays, 'day')}`,
      href: links.expiry({ status: 'expiring-soon' }),
      icon: CalendarClock,
      tone:
        kpis.expiresTodayCount > 0 ? 'urgent' : kpis.expiringSoonCount > 0 ? 'warning' : 'neutral',
    },
    {
      key: 'expired',
      label: 'Expired batches',
      value: kpis.expiredCount,
      subLabel: plural(kpis.expiredUnits, 'unit'),
      href: links.expiry({ status: 'expired' }),
      icon: PackageX,
      tone: kpis.expiredCount > 0 ? 'danger' : 'neutral',
    },
  ];
}

interface KpiGridProps {
  kpis: Kpis;
  alertDays: number;
}

export function KpiGrid({ kpis, alertDays }: KpiGridProps) {
  const tiles = buildKpiTiles(kpis, alertDays);
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-6 xl:grid-cols-5">
      {tiles.map((tile) => (
        <StaggerItem
          key={tile.key}
          className="min-w-0 max-md:last:col-span-2 md:col-span-2 xl:col-span-1 md:[&:nth-child(n+4)]:col-span-3 xl:[&:nth-child(n+4)]:col-span-1"
        >
          <StatCard
            label={tile.label}
            value={tile.value}
            subLabel={tile.subLabel}
            href={tile.href}
            icon={tile.icon}
            tone={tile.tone}
            layoutId={`kpi-${tile.key}`}
          />
        </StaggerItem>
      ))}
    </div>
  );
}
