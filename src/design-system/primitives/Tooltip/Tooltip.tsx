import { useState, type ReactNode } from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { AnimatePresence, m } from 'framer-motion';
import { cn } from '@/shared/cn';
import { durations, easings } from '../../motion/tokens';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delay?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  delay = 300,
  className,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  return (
    <RadixTooltip.Provider delayDuration={delay}>
      <RadixTooltip.Root open={open} onOpenChange={setOpen}>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <AnimatePresence>
          {open && (
            <RadixTooltip.Portal forceMount>
              <RadixTooltip.Content
                asChild
                forceMount
                side={side}
                align={align}
                sideOffset={6}
                collisionPadding={8}
              >
                <m.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    transition: { duration: durations.micro, ease: easings.out },
                  }}
                  exit={{ opacity: 0, transition: { duration: 0.08 } }}
                  style={{ transformOrigin: 'var(--radix-tooltip-content-transform-origin)' }}
                  className={cn(
                    'bg-fg text-bg shadow-raised z-50 max-w-64 rounded-sm px-2 py-1 text-xs font-medium',
                    className,
                  )}
                >
                  {content}
                </m.div>
              </RadixTooltip.Content>
            </RadixTooltip.Portal>
          )}
        </AnimatePresence>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
