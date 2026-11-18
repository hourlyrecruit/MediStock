import { Palette } from 'lucide-react';
import { ThemeSegmentedControl } from '@/design-system';
import { SettingsCard } from './SettingsCard';

export function AppearanceCard() {
  return (
    <SettingsCard
      icon={Palette}
      title="Appearance"
      description="Auto follows your device's light or dark setting."
    >
      <ThemeSegmentedControl />
    </SettingsCard>
  );
}
