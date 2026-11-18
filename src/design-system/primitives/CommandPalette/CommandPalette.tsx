import type { ReactNode } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { Command } from 'cmdk';
import { AnimatePresence, m } from 'framer-motion';
import { CornerDownLeft, Search, SearchX, type LucideIcon } from 'lucide-react';
import { springs } from '../../motion/tokens';
import { Backdrop } from '../internal/Backdrop';
import { Kbd } from '../Kbd/Kbd';

export interface CommandItemDef {
  id: string;
  label: string;
  hint?: string;
  icon?: LucideIcon;
  keywords?: string[];
  onSelect: () => void;
}

export interface CommandGroupDef {
  heading: string;
  items: readonly CommandItemDef[];
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: readonly CommandGroupDef[];
  placeholder?: string;
  empty?: ReactNode;
  label?: string;
}

export function CommandPalette({
  open,
  onOpenChange,
  groups,
  placeholder = 'Search medicines, pages and actions…',
  empty = 'No results found.',
  label = 'Command palette',
}: CommandPaletteProps) {
  const select = (item: CommandItemDef) => {
    onOpenChange(false);
    item.onSelect();
  };

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <RadixDialog.Portal forceMount>
            <Backdrop />
            <RadixDialog.Content asChild forceMount aria-describedby={undefined}>
              <m.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1, transition: springs.snappy }}
                exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
                className="glass shadow-raised fixed inset-x-4 top-[12dvh] z-50 mx-auto max-w-xl overflow-hidden rounded-xl border outline-none md:top-[18dvh]"
              >
                <RadixDialog.Title className="sr-only">{label}</RadixDialog.Title>
                <Command label={label} loop className="flex max-h-[min(480px,70dvh)] flex-col">
                  <div className="border-border-subtle flex items-center gap-3 border-b px-4">
                    <Search aria-hidden className="text-fg-faint size-4 shrink-0" />
                    <Command.Input
                      placeholder={placeholder}
                      className="text-fg placeholder:text-fg-faint h-14 w-full bg-transparent text-base outline-none md:text-sm"
                    />
                    <Kbd className="max-md:hidden">Esc</Kbd>
                  </div>
                  <Command.List className="min-h-0 flex-1 scroll-py-2 overflow-y-auto p-2">
                    <Command.Empty className="text-fg-muted flex flex-col items-center gap-2 py-10 text-sm">
                      <SearchX aria-hidden className="text-fg-faint size-5" />
                      {empty}
                    </Command.Empty>
                    {groups.map((group) => (
                      <Command.Group
                        key={group.heading}
                        heading={group.heading}
                        className="[&_[cmdk-group-heading]]:text-fg-faint mb-1 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium"
                      >
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Command.Item
                              key={item.id}
                              value={`${item.label} ${item.id}`}
                              keywords={item.keywords}
                              onSelect={() => select(item)}
                              className="group text-fg data-[selected=true]:bg-surface-muted flex h-11 cursor-pointer items-center gap-3 rounded-md px-3 text-sm select-none"
                            >
                              {Icon && (
                                <Icon
                                  aria-hidden
                                  className="text-fg-muted size-4 shrink-0"
                                  strokeWidth={1.75}
                                />
                              )}
                              <span className="flex-1 truncate">{item.label}</span>
                              {item.hint && (
                                <span className="text-fg-faint truncate text-xs">{item.hint}</span>
                              )}
                              <CornerDownLeft
                                aria-hidden
                                className="text-fg-faint size-3.5 shrink-0 opacity-0 group-data-[selected=true]:opacity-100"
                              />
                            </Command.Item>
                          );
                        })}
                      </Command.Group>
                    ))}
                  </Command.List>
                  <div className="border-border-subtle text-fg-muted flex items-center gap-4 border-t px-4 py-2.5 text-xs max-md:hidden">
                    <span className="inline-flex items-center gap-1.5">
                      <Kbd>↑</Kbd>
                      <Kbd>↓</Kbd> to navigate
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Kbd>↵</Kbd> to select
                    </span>
                  </div>
                </Command>
              </m.div>
            </RadixDialog.Content>
          </RadixDialog.Portal>
        )}
      </AnimatePresence>
    </RadixDialog.Root>
  );
}
