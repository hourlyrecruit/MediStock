import { useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Euler, Group, Vector3 } from 'three';

export const MAX_FRAME_DELTA = 0.1;
export const MOTION_SPEED = 1.8;

interface FloatOptions {
  phase?: number;
  amplitude?: number;
  speed?: number;
  wobble?: number;
  enabled?: boolean;
}

export function useFloat(
  ref: RefObject<Group | null>,
  base: { position: Vector3; rotation: Euler },
  { phase = 0, amplitude = 0.12, speed = 0.8, wobble = 0.08, enabled = true }: FloatOptions = {},
): void {
  const time = useRef(0);
  useFrame((_, delta) => {
    const group = ref.current;
    if (!group || !enabled) return;
    time.current += Math.min(delta, MAX_FRAME_DELTA);
    const t = time.current * speed * MOTION_SPEED + phase;
    group.position.set(base.position.x, base.position.y + Math.sin(t) * amplitude, base.position.z);
    group.rotation.set(
      base.rotation.x + Math.sin(t * 0.7) * wobble,
      base.rotation.y + Math.cos(t * 0.5) * wobble,
      base.rotation.z + Math.sin(t * 0.6 + 1.3) * wobble * 0.6,
    );
  });
}
