import { useEffect } from 'react';
import { Search } from 'lucide-react';
import { useUiStore } from '@/data/store/uiStore';
import { Breadcrumbs, usePageTitle } from './Breadcrumbs';
import { UserMenu } from './UserMenu';
import { NotificationBell } from './NotificationBell';
import { ThemeMenu } from './ThemeMenu';
import { GlobalSearch } from './GlobalSearch';
import { BrandMark } from '../layouts/BrandMark';

export function Header() {
  const title = usePageTitle();
  const setCommandOpen = useUiStore((s) => s.setCommandOpen);

  useEffect(() => {
    document.title = title === 'MediStock' ? title : `${title} · MediStock`;
  }, [title]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setCommandOpen]);

  return (
    <header className="glass sticky top-0 z-20 border-b">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-2 px-4 md:gap-3 md:px-6">
        <BrandMark compact className="md:hidden" />
        <div className="flex min-w-0 flex-1 items-center">
          <Breadcrumbs />
        </div>
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="focus-ring border-border-subtle bg-surface text-fg-faint hover:border-border-strong hidden h-10 w-64 items-center gap-2 rounded-md border px-3 text-sm shadow-xs transition-colors lg:flex"
        >
          <Search aria-hidden className="size-4" />
          <span className="flex-1 text-left">Search medicines…</span>
          <kbd className="border-border-subtle bg-bg-subtle text-fg-muted rounded-sm border px-1.5 font-sans text-[11px]">
            Ctrl K
          </kbd>
        </button>
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          aria-label="Search medicines"
          className="focus-ring text-fg-muted hover:bg-surface-muted grid size-11 place-items-center rounded-md lg:hidden motion-safe:hover:[&>svg]:scale-110 motion-safe:active:[&>svg]:scale-95"
        >
          <Search aria-hidden className="size-5" />
        </button>
        <ThemeMenu />
        <NotificationBell />
        <UserMenu />
      </div>
      <GlobalSearch />
    </header>
  );
}
