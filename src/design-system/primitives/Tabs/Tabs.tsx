import { useId, type ReactNode } from 'react';
import { cn } from '@/shared/cn';
import { useControllableState } from '../internal/useControllableState';
import { TabList, tabIds, type TabOption } from './TabList';

export interface TabItem<V extends string> extends TabOption<V> {
  content: ReactNode;
}

export interface TabsProps<V extends string> {
  items: readonly TabItem<V>[];
  value?: V;
  defaultValue?: V;
  onChange?: (value: V) => void;
  'aria-label': string;
  variant?: 'underline' | 'segmented';
  className?: string;
  panelClassName?: string;
}

export function Tabs<V extends string>({
  items,
  value,
  defaultValue,
  onChange,
  'aria-label': label,
  variant = 'underline',
  className,
  panelClassName,
}: TabsProps<V>) {
  const base = useId().replace(/:/g, '');
  const [current, setCurrent] = useControllableState<V | undefined>(
    value,
    defaultValue ?? items[0]?.value,
    (next) => {
      if (next !== undefined) onChange?.(next);
    },
  );
  const active = items.find((item) => item.value === current) ?? items[0];

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <TabList
        options={items}
        value={active?.value}
        onChange={setCurrent}
        label={label}
        variant={variant}
        idBase={base}
      />
      {active && (
        <div
          role="tabpanel"
          id={tabIds(base, active.value).panel}
          aria-labelledby={tabIds(base, active.value).tab}
          tabIndex={0}
          className={cn('focus-ring rounded-md', panelClassName)}
        >
          {active.content}
        </div>
      )}
    </div>
  );
}
