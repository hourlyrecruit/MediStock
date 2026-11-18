import type { ReactNode } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { AnimatePresence, m } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/shared/cn';
import { useIsMobile } from '@/shared/hooks';
import { springs } from '../../motion/tokens';
import { IconButton } from '../Button/IconButton';
import { Backdrop } from '../internal/Backdrop';
import { useControllableState } from '../internal/useControllableState';

export interface SheetProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const widths = { sm: 'md:w-[380px]', md: 'md:w-[480px]', lg: 'md:w-[640px]' };
const exitTransition = { duration: 0.22, ease: [0.4, 0, 1, 1] } as const;

export function Sheet({
  open,
  defaultOpen = false,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}: SheetProps) {
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const isMobile = useIsMobile();
  const offscreen = isMobile ? { y: '100%' } : { x: '100%' };

  return (
    <RadixDialog.Root open={isOpen} onOpenChange={setOpen}>
      {trigger && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
      <AnimatePresence>
        {isOpen && (
          <RadixDialog.Portal forceMount>
            <Backdrop />
            <RadixDialog.Content asChild forceMount>
              <m.div
                initial={{ ...offscreen, opacity: 0.8 }}
                animate={{ x: 0, y: 0, opacity: 1, transition: springs.smooth }}
                exit={{ ...offscreen, opacity: 0.8, transition: exitTransition }}
                className={cn(
                  'glass shadow-raised fixed z-50 flex flex-col border outline-none',
                  'inset-x-0 bottom-0 max-h-[92dvh] rounded-t-xl pb-[env(safe-area-inset-bottom)]',
                  'md:inset-y-0 md:right-0 md:left-auto md:h-dvh md:max-h-none md:rounded-none md:rounded-l-xl md:pb-0',
                  widths[size],
                  className,
                )}
              >
                <div
                  aria-hidden
                  className="bg-border-strong mx-auto mt-2 h-1 w-10 shrink-0 rounded-full md:hidden"
                />
                <div className="border-border-subtle flex items-start gap-4 border-b px-6 py-5 max-md:px-4 max-md:py-4">
                  <div className="min-w-0 flex-1">
                    <RadixDialog.Title className="text-fg text-lg font-semibold">
                      {title}
                    </RadixDialog.Title>
                    <RadixDialog.Description className="text-fg-muted mt-1 text-sm">
                      {description}
                    </RadixDialog.Description>
                  </div>
                  <RadixDialog.Close asChild>
                    <IconButton
                      aria-label="Close"
                      size="sm"
                      icon={<X className="size-4" />}
                      className="-mt-1 -mr-2"
                    />
                  </RadixDialog.Close>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 max-md:px-4">
                  {children}
                </div>
                {footer && (
                  <div className="border-border-subtle flex flex-col-reverse gap-2 border-t px-6 py-4 max-md:px-4 md:flex-row md:justify-end">
                    {footer}
                  </div>
                )}
              </m.div>
            </RadixDialog.Content>
          </RadixDialog.Portal>
        )}
      </AnimatePresence>
    </RadixDialog.Root>
  );
}

export const SheetClose = RadixDialog.Close;
