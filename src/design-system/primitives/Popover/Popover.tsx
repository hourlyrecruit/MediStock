import { createContext, useContext, type ReactNode } from 'react';
import * as RadixPopover from '@radix-ui/react-popover';
import { AnimatePresence, m } from 'framer-motion';
import { cn } from '@/shared/cn';
import { floatingMotion, floatingSurface } from '../internal/floating';
import { useControllableState } from '../internal/useControllableState';

const OpenContext = createContext(false);

interface PopoverProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Popover({ children, open, defaultOpen = false, onOpenChange }: PopoverProps) {
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  return (
    <OpenContext.Provider value={isOpen}>
      <RadixPopover.Root open={isOpen} onOpenChange={setOpen}>
        {children}
      </RadixPopover.Root>
    </OpenContext.Provider>
  );
}

export function PopoverTrigger({ children }: { children: ReactNode }) {
  return <RadixPopover.Trigger asChild>{children}</RadixPopover.Trigger>;
}

export function PopoverClose({ children }: { children: ReactNode }) {
  return <RadixPopover.Close asChild>{children}</RadixPopover.Close>;
}

interface PopoverContentProps {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  className?: string;
  'aria-label'?: string;
}

export function PopoverContent({
  children,
  align = 'center',
  side,
  sideOffset = 8,
  className,
  'aria-label': ariaLabel,
}: PopoverContentProps) {
  const open = useContext(OpenContext);
  return (
    <AnimatePresence>
      {open && (
        <RadixPopover.Portal forceMount>
          <RadixPopover.Content
            asChild
            forceMount
            align={align}
            side={side}
            sideOffset={sideOffset}
            collisionPadding={8}
            aria-label={ariaLabel}
          >
            <m.div
              {...floatingMotion}
              style={{ transformOrigin: 'var(--radix-popover-content-transform-origin)' }}
              className={cn(floatingSurface, 'w-72 max-w-[calc(100vw-16px)] p-4', className)}
            >
              {children}
            </m.div>
          </RadixPopover.Content>
        </RadixPopover.Portal>
      )}
    </AnimatePresence>
  );
}
