import { CanvasShell, type CanvasShellProps } from './CanvasShell';
import { WelcomeScene } from './WelcomeScene';

export type SceneCanvasProps = Omit<CanvasShellProps, 'children' | 'camera'>;

export function HeroCanvas(props: SceneCanvasProps) {
  return (
    <CanvasShell {...props} camera={{ position: [0, 1.2, 8], fov: 35 }}>
      <WelcomeScene />
    </CanvasShell>
  );
}
