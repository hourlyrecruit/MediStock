import { AnimatePresence, m } from 'framer-motion';
import { useIsMobile } from '@/shared/hooks';
import { springs } from '../../motion/tokens';
import { MAX_VISIBLE_TOASTS, useToastStore } from './store';
import { ToastCard } from './ToastCard';

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);
  const isMobile = useIsMobile();
  const visible = toasts.slice(0, MAX_VISIBLE_TOASTS);
  const offscreen = isMobile ? { y: -24 } : { x: 24 };

  return (
    <section
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center p-4 pt-[max(16px,env(safe-area-inset-top))] md:inset-x-auto md:top-auto md:right-0 md:bottom-0 md:p-6"
    >
      <ol
        aria-live="polite"
        className="flex w-full max-w-sm flex-col gap-2 md:w-[380px] md:flex-col-reverse"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((item) => (
            <m.li
              key={item.id}
              layout
              initial={{ opacity: 0, ...offscreen }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, ...offscreen, scale: 0.98, transition: { duration: 0.16 } }}
              transition={springs.snappy}
              className="pointer-events-auto"
            >
              <ToastCard toast={item} onDismiss={dismiss} />
            </m.li>
          ))}
        </AnimatePresence>
      </ol>
    </section>
  );
}
