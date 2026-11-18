import { TabList, type TabOption } from './TabList';

export interface SegmentedControlProps<V extends string> {
  options: readonly TabOption<V>[];
  value: V | undefined;
  onChange: (value: V) => void;
  'aria-label': string;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  className?: string;
}

export function SegmentedControl<V extends string>({
  'aria-label': label,
  ...props
}: SegmentedControlProps<V>) {
  return <TabList {...props} label={label} variant="segmented" />;
}
