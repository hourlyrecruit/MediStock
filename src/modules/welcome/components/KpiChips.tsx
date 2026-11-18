import {
  CalendarClock,
  CalendarX2,
  PackageCheck,
  TrendingDown,
  type LucideIcon,
} from 'lucide-react';
import { m } from 'framer-motion';
import { CountUp } from '@/design-system';
import { selectKpis, useInventory } from '@/data';
import { cn } from '@/shared/cn';
import { chipSequence, heroItem } from './motion';

interface Chip {
  key: string;
  label: string;
  value: number;
  icon: LucideIcon;
  tone: string;
}

export function KpiChips() {
  const kpis = useInventory(selectKpis);
  const chips: readonly Chip[] = [
    {
      key: 'usable',
      label: 'usable units',
      value: kpis.usableUnits,
      icon: PackageCheck,
      tone: 'text-primary',
    },
    {
      key: 'low',
      label: 'low stock',
      value: kpis.lowStockCount,
      icon: TrendingDown,
      tone: 'text-warning',
    },
    {
      key: 'expiring',
      label: 'expiring soon',
      value: kpis.expiringSoonCount + kpis.expiresTodayCount,
      icon: CalendarClock,
      tone: 'text-urgent',
    },
    {
      key: 'expired',
      label: 'expired',
      value: kpis.expiredCount,
      icon: CalendarX2,
      tone: 'text-danger',
    },
  ];

  return (
    <m.ul
      variants={chipSequence}
      aria-label="Inventory at a glance"
      className="flex flex-wrap gap-2"
    >
      {chips.map(({ key, label, value, icon: Icon, tone }) => (
        <m.li
          key={key}
          variants={heroItem}
          data-testid={`kpi-${key}`}
          className="glass inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm"
        >
          <Icon aria-hidden="true" className={cn('size-4 shrink-0', tone)} strokeWidth={1.75} />
          <CountUp value={value} duration={0.9} className="text-fg font-semibold" />
          <span className="text-fg-muted">{label}</span>
        </m.li>
      ))}
    </m.ul>
  );
}
