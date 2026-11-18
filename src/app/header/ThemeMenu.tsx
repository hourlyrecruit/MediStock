import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import type { ThemePreference } from '@/data/types';
import { useTheme } from '@/shared/hooks';

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'Auto (system)', icon: Monitor },
];

export function ThemeMenu() {
  const { preference, resolved, setTheme } = useTheme();
  const TriggerIcon = preference === 'system' ? Monitor : resolved === 'dark' ? Moon : Sun;

  return (
    <Dropdown.Root>
      <Dropdown.Trigger
        aria-label={`Theme: ${OPTIONS.find((o) => o.value === preference)?.label}`}
        className="focus-ring text-fg-muted hover:bg-surface-muted hover:text-fg grid size-11 place-items-center rounded-md transition-colors active:scale-[0.97] motion-safe:hover:[&>svg]:scale-110 motion-safe:active:[&>svg]:scale-95"
      >
        <TriggerIcon aria-hidden className="size-5" strokeWidth={1.75} />
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          align="end"
          sideOffset={8}
          className="glass shadow-raised z-50 min-w-48 rounded-lg border p-1.5"
        >
          <Dropdown.Label className="text-fg-faint px-3 py-1.5 text-xs font-medium">
            Theme
          </Dropdown.Label>
          <Dropdown.RadioGroup
            value={preference}
            onValueChange={(value) => setTheme(value as ThemePreference)}
          >
            {OPTIONS.map(({ value, label, icon: Icon }) => (
              <Dropdown.RadioItem
                key={value}
                value={value}
                className="data-highlighted:bg-surface-muted flex h-10 cursor-pointer items-center gap-2 rounded-sm px-3 text-sm outline-none"
              >
                <Icon aria-hidden className="text-fg-muted size-4" />
                <span className="flex-1">{label}</span>
                <Dropdown.ItemIndicator>
                  <Check aria-hidden className="text-primary size-4" />
                </Dropdown.ItemIndicator>
              </Dropdown.RadioItem>
            ))}
          </Dropdown.RadioGroup>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}
