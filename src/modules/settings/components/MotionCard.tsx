import { CirclePause, Sparkles, Wind } from 'lucide-react';
import { SegmentedControl, type TabOption } from '@/design-system';
import type { MotionPreference } from '@/data';
import { useMotion } from '@/shared/hooks';
import { SettingsCard } from './SettingsCard';

const options: readonly TabOption<MotionPreference>[] = [
  { value: 'on', label: 'On', icon: Sparkles },
  { value: 'off', label: 'Off', icon: CirclePause },
];

export function MotionCard() {
  const { preference, setMotion } = useMotion();
  return (
    <SettingsCard
      icon={Wind}
      title="Motion"
      description="Background shapes, page transitions, counters, charts and the 3D scene. Turn it off for a still interface."
    >
      <SegmentedControl
        aria-label="Motion"
        options={options}
        value={preference}
        onChange={setMotion}
      />
    </SettingsCard>
  );
}
