import { Suspense, useCallback, useState, type ComponentType, type ReactNode } from 'react';
import { cn } from '@/shared/cn';
import { FallbackBoundary } from './FallbackBoundary';
import { useCanRender3D } from './useCanRender3D';

const MAX_CONTEXT_LOSSES = 2;

export interface LazySceneProps {
  label: string;
  onFail: () => void;
  onReady: () => void;
  onContextLost: () => void;
}

interface Lazy3DFrameProps {
  scene: ComponentType<LazySceneProps>;
  fallback: ReactNode;
  label: string;
  className?: string;
}

export function Lazy3DFrame({ scene: Scene, fallback, label, className }: Lazy3DFrameProps) {
  const canRender = useCanRender3D();
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [losses, setLosses] = useState(0);
  const handleFail = useCallback(() => setFailed(true), []);
  const handleReady = useCallback(() => setReady(true), []);
  const handleContextLost = useCallback(() => {
    setReady(false);
    setLosses((count) => count + 1);
  }, []);
  const show3D = canRender && !failed && losses <= MAX_CONTEXT_LOSSES;

  return (
    <div className={cn('relative isolate overflow-hidden', className)}>
      <div
        aria-hidden="true"
        className="absolute inset-0 transition-opacity duration-700 ease-out"
        style={{ opacity: show3D && ready ? 0 : 1 }}
      >
        {fallback}
      </div>
      {show3D ? (
        <FallbackBoundary
          key={losses}
          fallback={<span className="sr-only">{label}</span>}
          onError={handleFail}
        >
          <Suspense fallback={<span className="sr-only">{label}</span>}>
            <Scene
              label={label}
              onFail={handleFail}
              onReady={handleReady}
              onContextLost={handleContextLost}
            />
          </Suspense>
        </FallbackBoundary>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
}
