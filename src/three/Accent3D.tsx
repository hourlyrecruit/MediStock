import { lazy, type ReactNode } from 'react';
import { Lazy3DFrame } from './Lazy3DFrame';
import { StaticAccentFallback } from './StaticAccentFallback';

const AccentCanvas = lazy(() => import('./AccentCanvas').then((mod) => ({ default: mod.AccentCanvas })));

export const ACCENT_3D_LABEL = 'Illustration of a slowly rotating green and white capsule';

export interface Accent3DProps {
  fallback?: ReactNode;
  label?: string;
  className?: string;
}

export function Accent3D({ fallback, label = ACCENT_3D_LABEL, className }: Accent3DProps) {
  return (
    <Lazy3DFrame
      scene={AccentCanvas}
      fallback={fallback ?? <StaticAccentFallback />}
      label={label}
      className={className}
    />
  );
}
