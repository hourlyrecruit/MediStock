import { PageHeader } from '@/design-system';
import { isDemoMode } from '@/data';
import { AlertsCard } from '../components/AlertsCard';
import { AppearanceCard } from '../components/AppearanceCard';
import { CurrencyCard } from '../components/CurrencyCard';
import { DemoDataCard } from '../components/DemoDataCard';
import { MotionCard } from '../components/MotionCard';
import { PharmacyCard } from '../components/PharmacyCard';

export function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Settings"
        description="Pharmacy details, alert thresholds, appearance, motion and demo data."
      />
      <div className="flex flex-col gap-4">
        <PharmacyCard />
        <AlertsCard />
        <CurrencyCard />
        <AppearanceCard />
        <MotionCard />
        {isDemoMode() ? <DemoDataCard /> : null}
      </div>
    </div>
  );
}
