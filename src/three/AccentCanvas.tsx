import { CanvasShell } from './CanvasShell';
import { CapsuleAccent } from './CapsuleAccent';
import type { SceneCanvasProps } from './HeroCanvas';

export function AccentCanvas(props: SceneCanvasProps) {
  return (
    <CanvasShell {...props} camera={{ position: [0, 0, 5], fov: 30 }}>
      <CapsuleAccent />
    </CanvasShell>
  );
}
