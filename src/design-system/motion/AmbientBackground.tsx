import type { CSSProperties } from 'react';
import {
  Bandage,
  Cross,
  FlaskConical,
  HeartPulse,
  Pill,
  PillBottle,
  Stethoscope,
  Syringe,
  Tablets,
  TestTube,
  Thermometer,
  type LucideIcon,
} from 'lucide-react';
import { useReducedMotion } from '@/shared/hooks/useMotion';
import { cn } from '@/shared/cn';

interface Shape {
  icon: LucideIcon;
  left: number;
  top: number;
  size: number;
  x: number;
  y: number;
  rotate: number;
  duration: number;
  delay: number;
  desktopOnly?: boolean;
}

const SHAPES: readonly Shape[] = [
  { icon: Pill, left: 6, top: 12, size: 44, x: 60, y: 40, rotate: 35, duration: 35, delay: -4 },
  {
    icon: Cross,
    left: 22,
    top: 64,
    size: 34,
    x: -40,
    y: 55,
    rotate: -25,
    duration: 40,
    delay: -18,
  },
  {
    icon: PillBottle,
    left: 38,
    top: 22,
    size: 52,
    x: 45,
    y: -50,
    rotate: 18,
    duration: 45,
    delay: -9,
    desktopOnly: true,
  },
  {
    icon: Tablets,
    left: 54,
    top: 78,
    size: 40,
    x: -55,
    y: -35,
    rotate: -30,
    duration: 34,
    delay: -27,
  },
  {
    icon: Syringe,
    left: 70,
    top: 8,
    size: 46,
    x: -50,
    y: 60,
    rotate: 40,
    duration: 46,
    delay: -12,
    desktopOnly: true,
  },
  {
    icon: Thermometer,
    left: 86,
    top: 40,
    size: 38,
    x: -45,
    y: -40,
    rotate: -20,
    duration: 38,
    delay: -33,
  },
  {
    icon: HeartPulse,
    left: 12,
    top: 88,
    size: 42,
    x: 50,
    y: -45,
    rotate: 15,
    duration: 42,
    delay: -21,
    desktopOnly: true,
  },
  {
    icon: FlaskConical,
    left: 92,
    top: 84,
    size: 36,
    x: -35,
    y: -55,
    rotate: 28,
    duration: 37,
    delay: -6,
  },
  {
    icon: Stethoscope,
    left: 46,
    top: 50,
    size: 56,
    x: 40,
    y: 45,
    rotate: -15,
    duration: 49,
    delay: -40,
    desktopOnly: true,
  },
  {
    icon: Bandage,
    left: 78,
    top: 62,
    size: 38,
    x: 55,
    y: 35,
    rotate: 45,
    duration: 32,
    delay: -15,
    desktopOnly: true,
  },
  {
    icon: TestTube,
    left: 30,
    top: 4,
    size: 34,
    x: -30,
    y: 50,
    rotate: -35,
    duration: 36,
    delay: -30,
    desktopOnly: true,
  },
  { icon: Pill, left: 62, top: 34, size: 30, x: -45, y: 40, rotate: 60, duration: 32, delay: -24 },
];

const DRIFT_SPEED = 2.2;

function shapeStyle(shape: Shape): CSSProperties {
  return {
    left: `${shape.left}%`,
    top: `${shape.top}%`,
    '--drift-x': `${shape.x}px`,
    '--drift-y': `${shape.y}px`,
    '--drift-rotate': `${shape.rotate}deg`,
    '--drift-duration': `${shape.duration / DRIFT_SPEED}s`,
    '--drift-delay': `${shape.delay / DRIFT_SPEED}s`,
  } as CSSProperties;
}

export function AmbientBackground({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <div
      aria-hidden
      className={cn(
        'text-fg-faint pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden',
        className,
      )}
    >
      {SHAPES.map((shape, index) => {
        const Icon = shape.icon;
        return (
          <span
            key={index}
            style={shapeStyle(shape)}
            className={cn(
              'absolute opacity-[0.14] will-change-transform dark:opacity-[0.1]',
              !reduce && 'animate-drift',
              shape.desktopOnly && 'hidden md:block',
            )}
          >
            <Icon size={shape.size} strokeWidth={1.25} />
          </span>
        );
      })}
    </div>
  );
}
