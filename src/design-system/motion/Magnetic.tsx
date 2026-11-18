import { useEffect, useRef, type ReactNode } from 'react';
import { m, useSpring } from 'framer-motion';
import { cn } from '@/shared/cn';
import { springs } from './tokens';
import { usePointerEffects } from './useFinePointer';

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  radius?: number;
  className?: string;
}

export function Magnetic({ children, strength = 8, radius = 120, className }: MagneticProps) {
  const enabled = usePointerEffects();
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, springs.gentle);
  const y = useSpring(0, springs.gentle);

  useEffect(() => {
    if (!enabled) return;
    const handleMove = (event: PointerEvent) => {
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(dx, dy);
      const reach = radius + Math.max(rect.width, rect.height) / 2;
      if (distance > reach || distance === 0) {
        x.set(0);
        y.set(0);
        return;
      }
      const pull = (1 - distance / reach) * strength;
      x.set((dx / distance) * pull);
      y.set((dy / distance) * pull);
    };
    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handleMove);
      x.set(0);
      y.set(0);
    };
  }, [enabled, radius, strength, x, y]);

  return (
    <m.div
      ref={ref}
      style={enabled ? { x, y } : undefined}
      className={cn('inline-block', className)}
    >
      {children}
    </m.div>
  );
}
