import { lazy, type ReactNode } from 'react';
import { Lazy3DFrame } from './Lazy3DFrame';
import { StaticHeroFallback } from './StaticHeroFallback';

const HeroCanvas = lazy(() => import('./HeroCanvas').then((mod) => ({ default: mod.HeroCanvas })));

export const HERO_3D_LABEL = 'Illustration of floating capsules, a medicine bottle and a medical cross';

export interface Hero3DProps {
  fallback?: ReactNode;
  label?: string;
  className?: string;
}

export function Hero3D({ fallback, label = HERO_3D_LABEL, className }: Hero3DProps) {
  return (
    <Lazy3DFrame
      scene={HeroCanvas}
      fallback={fallback ?? <StaticHeroFallback />}
      label={label}
      className={className}
    />
  );
}
