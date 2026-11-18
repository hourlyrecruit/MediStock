import { useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { NavLink } from 'react-router';
import { ChevronsLeft } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { navItems } from '../registry';
import { useUiStore } from '@/data/store/uiStore';
import { useInventoryStore } from '@/data/store/inventoryStore';
import { springs } from '@/design-system/motion';
import { useIsDesktop } from '@/shared/hooks';
import { cn } from '@/shared/cn';
import { BrandMark } from './BrandMark';

const EXPANDED = 264;
const RAIL = 72;

export function Sidebar() {
  const isDesktop = useIsDesktop();
  const collapsedPref = useUiStore((s) => s.sidebarCollapsed);
  const pharmacyName = useInventoryStore((s) => s.settings.pharmacyName);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const [tabletOpen, setTabletOpen] = useState(false);
  const collapsed = isDesktop ? collapsedPref : !tabletOpen;
  const toggle = isDesktop ? toggleSidebar : () => setTabletOpen((open) => !open);

  return (
    <div
      className="relative z-30 hidden shrink-0 md:block"
      style={isDesktop ? undefined : { width: RAIL }}
    >
      <m.aside
        aria-label="Primary"
        initial={false}
        animate={{ width: collapsed ? RAIL : EXPANDED }}
        transition={springs.smooth}
        className={cn(
          'glass sticky top-0 flex h-dvh flex-col border-r',
          !isDesktop && !collapsed && 'shadow-raised',
        )}
      >
        <div className="flex h-16 items-center px-4">
          <BrandMark compact={collapsed} />
        </div>
        {!collapsed && (
          <p className="text-fg-muted -mt-2 truncate px-[68px] pb-2 text-xs" title={pharmacyName}>
            {pharmacyName}
          </p>
        )}
        <nav className="flex-1 overflow-x-hidden overflow-y-auto px-3 py-2">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const link = (
                <NavLink
                  to={item.path}
                  onClick={() => setTabletOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'group/nav focus-ring relative flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium',
                      isActive
                        ? 'text-primary-press'
                        : 'text-fg-muted hover:bg-surface-muted hover:text-fg',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <m.span
                          layoutId="sidebar-active"
                          transition={springs.snappy}
                          className="bg-primary-tint absolute inset-0 rounded-md"
                        />
                      )}
                      <Icon
                        aria-hidden
                        className="relative size-5 shrink-0 motion-safe:group-hover/nav:scale-110 motion-safe:group-active/nav:scale-95"
                        strokeWidth={1.75}
                      />
                      <AnimatePresence initial={false}>
                        {!collapsed && (
                          <m.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { delay: 0.08, duration: 0.15 } }}
                            exit={{ opacity: 0, transition: { duration: 0.08 } }}
                            className="relative truncate"
                          >
                            {item.label}
                          </m.span>
                        )}
                      </AnimatePresence>
                      {collapsed && <span className="sr-only">{item.label}</span>}
                    </>
                  )}
                </NavLink>
              );
              return (
                <li key={item.id}>
                  {collapsed ? (
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>{link}</Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          side="right"
                          sideOffset={8}
                          className="bg-fg text-bg shadow-raised z-50 rounded-sm px-2 py-1 text-xs font-medium"
                        >
                          {item.label}
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  ) : (
                    link
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-border-subtle border-t p-3">
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            className="focus-ring text-fg-muted hover:bg-surface-muted hover:text-fg flex h-11 w-full items-center gap-3 rounded-md px-3 transition-colors"
          >
            <m.span animate={{ rotate: collapsed ? 180 : 0 }} transition={springs.smooth}>
              <ChevronsLeft aria-hidden className="size-5" strokeWidth={1.75} />
            </m.span>
            {!collapsed && <span className="text-sm font-medium">Collapse</span>}
          </button>
        </div>
      </m.aside>
    </div>
  );
}
