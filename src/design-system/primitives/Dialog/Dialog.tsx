import type { ReactNode } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { AnimatePresence, m, type TargetAndTransition } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/shared/cn';
import { useIsMobile } from '@/shared/hooks';
import { springs } from '../../motion/tokens';
import { IconButton } from '../Button/IconButton';
import { Backdrop } from '../internal/Backdrop';
import { useControllableState } from '../internal/useControllableState';

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  dismissible?: boolean;
  hideClose?: boolean;
  className?: string;
}

const widths = { sm: 'md:max-w-md', md: 'md:max-w-lg', lg: 'md:max-w-2xl' };

const sheetMotion: Record<'initial' | 'animate' | 'exit', TargetAndTransition> = {
  initial: { y: '100%', opacity: 0.6 },
  animate: { y: 0, opacity: 1, transition: springs.smooth },
  exit: { y: '100%', opacity: 0, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
};

const centerMotion: Record<'initial' | 'animate' | 'exit', TargetAndTransition> = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: springs.snappy },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.12 } },
};

export function Dialog({
  open,
  defaultOpen = false,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  size = 'md',
  dismissible = true,
  hideClose = false,
  className,
}: DialogProps) {
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const isMobile = useIsMobile();
  const motion = isMobile ? sheetMotion : centerMotion;
  const block = (event: Event) => {
    if (!dismissible) event.preventDefault();
  };

  return (
    <RadixDialog.Root open={isOpen} onOpenChange={setOpen}>
      {trigger && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
      <AnimatePresence>
        {isOpen && (
          <RadixDialog.Portal forceMount>
            <Backdrop />
            <RadixDialog.Content
              asChild
              forceMount
              onEscapeKeyDown={block}
              onPointerDownOutside={block}
              onInteractOutside={block}
            >
              <m.div
                {...motion}
                className={cn(
                  'glass shadow-raised fixed z-50 flex flex-col border outline-none',
                  'inset-x-0 bottom-0 max-h-[92dvh] rounded-t-xl pb-[env(safe-area-inset-bottom)]',
                  'md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:max-h-[85dvh] md:w-[calc(100%-48px)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl md:pb-0',
                  widths[size],
                  className,
                )}
              >
                <div
                  aria-hidden
                  className="bg-border-strong mx-auto mt-2 h-1 w-10 shrink-0 rounded-full md:hidden"
                />
                <div className="flex items-start gap-4 px-6 pt-5 pb-4 max-md:px-4">
                  <div className="min-w-0 flex-1">
                    <RadixDialog.Title className="text-fg text-lg font-semibold">
                      {title}
                    </RadixDialog.Title>
                    <RadixDialog.Description className="text-fg-muted mt-1 text-sm">
                      {description}
                    </RadixDialog.Description>
                  </div>
                  {!hideClose && (
                    <RadixDialog.Close asChild>
                      <IconButton
                        aria-label="Close"
                        size="sm"
                        icon={<X className="size-4" />}
                        className="-mt-1 -mr-2"
                      />
                    </RadixDialog.Close>
                  )}
                </div>
                {children && (
                  <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 max-md:px-4">
                    {children}
                  </div>
                )}
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

export const DialogClose = RadixDialog.Close;
