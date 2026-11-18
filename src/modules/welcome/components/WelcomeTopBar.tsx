import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import { IconButton, ThemeSegmentedControl } from '@/design-system';
import type { ThemePreference } from '@/data';
import { useTheme } from '@/shared/hooks';

const THEME_CYCLE: Record<
  ThemePreference,
  { next: ThemePreference; label: string; icon: LucideIcon }
> = {
  light: { next: 'dark', label: 'Light', icon: Sun },
  dark: { next: 'system', label: 'Dark', icon: Moon },
  system: { next: 'light', label: 'Auto', icon: Monitor },
};

function LogoMark() {
  return (
    <span className="bg-primary grid size-9 shrink-0 place-items-center rounded-[11px] md:size-10 md:rounded-[12px]">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="fill-primary-fg size-5">
        <path d="M9.5 3h5v6.5H21v5h-6.5V21h-5v-6.5H3v-5h6.5z" />
      </svg>
    </span>
  );
}

function CompactThemeToggle() {
  const { preference, setTheme } = useTheme();
  const current = THEME_CYCLE[preference];
  const Icon = current.icon;
  return (
    <IconButton
      aria-label={`Theme: ${current.label}. Switch to ${THEME_CYCLE[current.next].label}`}
      icon={<Icon className="size-5" strokeWidth={1.75} />}
      variant="secondary"
      round
      onClick={() => setTheme(current.next)}
    />
  );
}

export function WelcomeTopBar() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-4 md:h-20 md:px-8">
        <div className="flex items-center gap-3">
          <LogoMark />
          <span className="text-lg font-semibold tracking-tight">MediStock</span>
        </div>
        <div className="md:hidden">
          <CompactThemeToggle />
        </div>
        <ThemeSegmentedControl size="sm" className="hidden md:inline-flex" />
      </div>
    </header>
  );
}
