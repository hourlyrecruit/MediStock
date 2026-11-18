import { createContext, useContext, type ReactNode } from 'react';
import * as Menu from '@radix-ui/react-dropdown-menu';
import { AnimatePresence, m } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/cn';
import { floatingMotion, floatingSurface } from '../internal/floating';
import { useControllableState } from '../internal/useControllableState';

const OpenContext = createContext(false);

interface DropdownProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
}

export function Dropdown({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  modal,
}: DropdownProps) {
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  return (
    <OpenContext.Provider value={isOpen}>
      <Menu.Root open={isOpen} onOpenChange={setOpen} modal={modal}>
        {children}
      </Menu.Root>
    </OpenContext.Provider>
  );
}

export function DropdownTrigger({ children }: { children: ReactNode }) {
  return <Menu.Trigger asChild>{children}</Menu.Trigger>;
}

interface DropdownContentProps {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  className?: string;
}

export function DropdownContent({
  children,
  align = 'end',
  side,
  sideOffset = 8,
  className,
}: DropdownContentProps) {
  const open = useContext(OpenContext);
  return (
    <AnimatePresence>
      {open && (
        <Menu.Portal forceMount>
          <Menu.Content
            asChild
            forceMount
            align={align}
            side={side}
            sideOffset={sideOffset}
            collisionPadding={8}
          >
            <m.div
              {...floatingMotion}
              style={{ transformOrigin: 'var(--radix-dropdown-menu-content-transform-origin)' }}
              className={cn(floatingSurface, 'min-w-48', className)}
            >
              {children}
            </m.div>
          </Menu.Content>
        </Menu.Portal>
      )}
    </AnimatePresence>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  onSelect?: (event: Event) => void;
  icon?: LucideIcon;
  shortcut?: string;
  destructive?: boolean;
  disabled?: boolean;
  className?: string;
}

export function DropdownItem({
  children,
  onSelect,
  icon: Icon,
  shortcut,
  destructive,
  disabled,
  className,
}: DropdownItemProps) {
  return (
    <Menu.Item
      onSelect={onSelect}
      disabled={disabled}
      className={cn(
        'flex h-10 cursor-pointer items-center gap-2 rounded-sm px-3 text-sm transition-colors outline-none select-none pointer-coarse:h-11',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
        destructive
          ? 'text-danger data-highlighted:bg-danger-soft'
          : 'text-fg data-highlighted:bg-surface-muted',
        className,
      )}
    >
      {Icon && (
        <Icon aria-hidden className={cn('size-4 shrink-0', !destructive && 'text-fg-muted')} />
      )}
      <span className="flex-1 truncate">{children}</span>
      {shortcut && <span className="text-fg-faint text-xs">{shortcut}</span>}
    </Menu.Item>
  );
}

export function DropdownSeparator() {
  return <Menu.Separator className="bg-border-subtle my-1 h-px" />;
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return (
    <Menu.Label className="text-fg-faint px-3 pt-2 pb-1 text-xs font-medium">{children}</Menu.Label>
  );
}
