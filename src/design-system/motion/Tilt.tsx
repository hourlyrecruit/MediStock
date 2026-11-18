import type { PointerEvent, ReactNode } from 'react';
import { m, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/shared/cn';
import { springs } from './tokens';
import { usePointerEffects } from './useFinePointer';

interface TiltProps {
  children: ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}

export function Tilt({ children, className, max = 6, glare = true }: TiltProps) {
  const enabled = usePointerEffects();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const active = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), springs.gentle);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), springs.gentle);
  const glareOpacity = useSpring(active, springs.gentle);
  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const background = useMotionTemplate`radial-gradient(420px circle at ${gx} ${gy}, color-mix(in srgb, var(--fg) 4%, transparent), transparent 60%)`;

  if (!enabled) return <div className={cn('relative', className)}>{children}</div>;

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
    active.set(1);
  };

  const reset = () => {
    px.set(0.5);
    py.set(0.5);
    active.set(0);
  };

  return (
    <div className={cn('relative perspective-[900px]', className)}>
      <m.div
        onPointerMove={handleMove}
        onPointerLeave={reset}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative h-full rounded-[inherit]"
      >
        {children}
        {glare && (
          <m.div
            aria-hidden
            style={{ background, opacity: glareOpacity }}
            className="pointer-events-none absolute inset-0 rounded-lg"
          />
        )}
      </m.div>
    </div>
  );
}
