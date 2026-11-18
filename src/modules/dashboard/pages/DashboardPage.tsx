import { Stagger, StaggerItem } from '@/design-system';
import { CategoryTile, MonthlyAdditionsTile } from '../components/ChartTiles';
import { ExpiryTile } from '../components/ExpiryTile';
import { HeroTile } from '../components/HeroTile';
import { KpiGrid } from '../components/KpiGrid';
import { LowStockTile } from '../components/LowStockTile';
import { useKpis, useSettings } from '../hooks/useDashboardData';

export function DashboardPage() {
  const kpis = useKpis();
  const settings = useSettings();

  return (
    <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-6 md:gap-6 xl:grid-cols-12">
      <StaggerItem className="md:col-span-6 xl:col-span-12">
        <HeroTile
          pharmacyName={settings.pharmacyName}
          kpis={kpis}
          alertDays={settings.expiryAlertDays}
        />
      </StaggerItem>
      <section aria-label="Key figures" className="md:col-span-6 xl:col-span-12">
        <KpiGrid kpis={kpis} alertDays={settings.expiryAlertDays} />
      </section>
      <StaggerItem className="min-w-0 md:col-span-6 xl:col-span-5">
        <CategoryTile />
      </StaggerItem>
      <StaggerItem className="min-w-0 md:col-span-6 xl:col-span-7">
        <MonthlyAdditionsTile />
      </StaggerItem>
      <StaggerItem className="min-w-0 md:col-span-6 xl:col-span-6">
        <LowStockTile />
      </StaggerItem>
      <StaggerItem className="min-w-0 md:col-span-6 xl:col-span-6">
        <ExpiryTile />
      </StaggerItem>
    </Stagger>
  );
}
