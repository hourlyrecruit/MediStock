import { format } from 'date-fns';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { buttonBase, buttonSizes, buttonVariants } from '@/design-system';
import type { Kpis } from '@/data';
import { Accent3D } from '@/three';
import { ResponsiveImage, images } from '@/assets/images';
import { useMediaQuery, useToday } from '@/shared/hooks';
import { cn } from '@/shared/cn';
import { formatNumber } from '@/shared/format';
import { links } from '@/shared/routes';
import { greetingFor } from '../lib/greeting';

interface HeroTileProps {
  pharmacyName: string;
  kpis: Kpis;
  alertDays: number;
  now?: Date;
}

const count = (value: number, word: string) =>
  `${formatNumber(value)} ${word}${value === 1 ? '' : 's'}`;

export function inventorySummary(kpis: Kpis, alertDays: number) {
  const parts = [
    `${count(kpis.usableUnits, 'usable unit')} across ${count(kpis.activeMedicines, 'active medicine')}`,
  ];
  const attention: string[] = [];
  if (kpis.lowStockCount > 0) attention.push(`${formatNumber(kpis.lowStockCount)} low on stock`);
  const expiring = kpis.expiringSoonCount + kpis.expiresTodayCount;
  if (expiring > 0) attention.push(`${formatNumber(expiring)} expiring within ${alertDays} days`);
  if (attention.length === 0) return `${parts[0]}. Nothing needs attention right now.`;
  return `${parts[0]}. ${attention.join(', ')}.`;
}

export function HeroTile({ pharmacyName, kpis, alertDays, now }: HeroTileProps) {
  const today = useToday();
  const greeting = greetingFor(now ?? new Date());
  const showVisual = useMediaQuery('(min-width: 768px)');
  return (
    <div className="card relative grid overflow-hidden md:grid-cols-[minmax(0,1fr)_minmax(0,40%)]">
      <div className="relative z-10 flex flex-col justify-center gap-4 p-6 md:p-8">
        <p className="tabular text-fg-muted text-sm">
          {format(today, 'EEEE')}, {format(today, 'dd MMM yyyy')}
        </p>
        <div>
          <h1 className="text-fg text-2xl font-semibold tracking-tight">
            {greeting}, <span className="text-primary">{pharmacyName}</span>
          </h1>
          <p className="text-fg-muted mt-2 max-w-xl text-sm md:text-base">
            {inventorySummary(kpis, alertDays)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={links.stock()}
            className={cn(
              buttonBase,
              buttonVariants.primary,
              buttonSizes.md,
              'active:scale-[0.97]',
            )}
          >
            Manage stock
            <ArrowRight aria-hidden className="nudge size-4" />
          </Link>
          <Link
            to={links.report('catalogue')}
            className={cn(
              buttonBase,
              buttonVariants.secondary,
              buttonSizes.md,
              'active:scale-[0.97]',
            )}
          >
            View reports
          </Link>
        </div>
      </div>
      {showVisual && (
        <div className="relative min-h-56">
          <div className="absolute inset-0 opacity-55 dark:opacity-40">
            <ResponsiveImage
              image={images.dashboardTile}
              sizes="(min-width: 1280px) 560px, 40vw"
              grade
              fill
            />
          </div>
          <div
            aria-hidden
            className="from-surface via-surface/60 pointer-events-none absolute inset-0 bg-linear-to-r to-transparent"
          />
          <Accent3D className="absolute top-1/2 left-0 size-44 -translate-y-1/2 xl:size-52" />
        </div>
      )}
    </div>
  );
}
