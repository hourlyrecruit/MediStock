import { useState } from 'react';
import { NavLink } from 'react-router';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, m } from 'framer-motion';
import { Ellipsis, X } from 'lucide-react';
import { mobileMoreItems, mobileTabs } from '../registry';
import { springs } from '@/design-system/motion';
import { cn } from '@/shared/cn';

const tabClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'group/tab focus-ring flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium',
    isActive ? 'text-primary' : 'text-fg-muted',
  );

export function MobileTabBar() {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Primary mobile"
        className="glass fixed inset-x-0 bottom-0 z-30 border-t pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="flex">
          {mobileTabs.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className="flex flex-1">
                <NavLink to={item.path} className={tabClass}>
                  <Icon
                    aria-hidden
                    className="size-5 motion-safe:group-active/tab:scale-90"
                    strokeWidth={1.75}
                  />
                  <span>{item.label.replace(' Management', '')}</span>
                </NavLink>
              </li>
            );
          })}
          <li className="flex flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={tabClass({ isActive: false })}
              aria-haspopup="dialog"
            >
              <Ellipsis aria-hidden className="size-5 motion-safe:group-active/tab:scale-90" />
              <span>More</span>
            </button>
          </li>
        </ul>
      </nav>
      <Dialog.Root open={moreOpen} onOpenChange={setMoreOpen}>
        <AnimatePresence>
          {moreOpen && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <m.div
                  className="bg-overlay fixed inset-0 z-40 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              </Dialog.Overlay>
              <Dialog.Content asChild>
                <m.div
                  className="glass shadow-raised fixed inset-x-0 bottom-0 z-50 rounded-t-xl border p-4 pb-8"
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={springs.smooth}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <Dialog.Title className="text-base font-semibold">More</Dialog.Title>
                    <Dialog.Close
                      aria-label="Close"
                      className="focus-ring text-fg-muted grid size-11 place-items-center rounded-md"
                    >
                      <X aria-hidden className="size-5" />
                    </Dialog.Close>
                  </div>
                  <Dialog.Description className="sr-only">
                    More sections of MediStock
                  </Dialog.Description>
                  <ul className="grid gap-1">
                    {mobileMoreItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.id}>
                          <NavLink
                            to={item.path}
                            onClick={() => setMoreOpen(false)}
                            className={({ isActive }) =>
                              cn(
                                'focus-ring flex h-12 items-center gap-3 rounded-md px-3 font-medium',
                                isActive
                                  ? 'bg-primary-tint text-primary-press'
                                  : 'hover:bg-surface-muted',
                              )
                            }
                          >
                            <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                            {item.label}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                </m.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </>
  );
}
