import { Monitor, Moon, Sun } from 'lucide-react';
import type { ThemePreference } from '@/data/types';
import { useTheme } from '@/shared/hooks';
import { SegmentedControl } from '../Tabs/SegmentedControl';
import type { TabOption } from '../Tabs/TabList';

const options: readonly TabOption<ThemePreference>[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'Auto', icon: Monitor },
];

interface ThemeSegmentedControlProps {
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  className?: string;
}

export function ThemeSegmentedControl({ size, fullWidth, className }: ThemeSegmentedControlProps) {
  const { preference, setTheme } = useTheme();
  return (
    <SegmentedControl
      aria-label="Theme"
      options={options}
      value={preference}
      onChange={setTheme}
      size={size}
      fullWidth={fullWidth}
      className={className}
    />
  );
}
