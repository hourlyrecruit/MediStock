import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, type RootState } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { PointerContext, type PointerState } from './rigs/pointer';

const MAX_DPR = 1.75;
const MAX_DECLINES = 3;

export function performanceBounds(refreshRate: number): [number, number] {
  return [Math.min(20, refreshRate * 0.5), Math.min(50, refreshRate * 0.85)];
}

export interface CanvasShellProps {
  label: string;
  children: ReactNode;
  camera?: { position: [number, number, number]; fov: number };
  className?: string;
  onFail?: () => void;
  onReady?: () => void;
  onContextLost?: () => void;
}

function FirstFrame({ onFirstFrame }: { onFirstFrame: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    onFirstFrame();
  });
  return null;
}

const DEFAULT_CAMERA: NonNullable<CanvasShellProps['camera']> = { position: [0, 0, 8], fov: 35 };

function initialDpr() {
  return Math.min(window.devicePixelRatio || 1, MAX_DPR);
}

export function CanvasShell({
  label,
  children,
  camera = DEFAULT_CAMERA,
  className,
  onFail,
  onReady,
  onContextLost,
}: CanvasShellProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const pointer = useRef<PointerState>({ x: 0, y: 0 });
  const declines = useRef(0);
  const [dpr, setDpr] = useState(initialDpr);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(() => document.visibilityState !== 'hidden');
  const [ready, setReady] = useState(false);
  const active = inView && tabVisible;

  useEffect(() => {
    const node = wrapper.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (entry) setInView(entry.isIntersecting);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () => setTabVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    return () => window.removeEventListener('pointermove', onPointer);
  }, []);

  const handleCreated = useCallback(
    (state: RootState) => {
      const canvas = state.gl.domElement;
      const onLost = (event: Event) => {
        event.preventDefault();
        onContextLost?.();
      };
      canvas.addEventListener('webglcontextlost', onLost, { once: true });
    },
    [onContextLost],
  );

  const handleFirstFrame = useCallback(() => {
    requestAnimationFrame(() => {
      setReady(true);
      onReady?.();
    });
  }, [onReady]);

  const handleDecline = useCallback(() => {
    if (dpr > 1) {
      declines.current = 0;
      setDpr(1);
      return;
    }
    declines.current += 1;
    if (declines.current >= MAX_DECLINES) onFail?.();
  }, [dpr, onFail]);

  const handleIncline = useCallback(() => {
    declines.current = 0;
  }, []);

  return (
    <div ref={wrapper} className={className ?? 'absolute inset-0'}>
      <span className="sr-only">{label}</span>
      <div
        aria-hidden="true"
        className="absolute inset-0 transition-opacity duration-700 ease-out"
        style={{ opacity: ready ? 1 : 0 }}
      >
        <Canvas
          dpr={dpr}
          frameloop={active ? 'always' : 'never'}
          camera={camera}
          gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
          onCreated={handleCreated}
          aria-hidden="true"
        >
          <FirstFrame onFirstFrame={handleFirstFrame} />
          <PerformanceMonitor
            bounds={performanceBounds}
            onDecline={handleDecline}
            onIncline={handleIncline}
          >
            <PointerContext.Provider value={pointer}>{children}</PointerContext.Provider>
          </PerformanceMonitor>
        </Canvas>
      </div>
    </div>
  );
}
