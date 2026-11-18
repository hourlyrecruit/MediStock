import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { Capsule } from './objects/Capsule';
import { StudioLights } from './rigs/StudioLights';
import { MAX_FRAME_DELTA, MOTION_SPEED } from './rigs/useFloat';

const SPIN_RAD_PER_SECOND = 0.4;

export function CapsuleAccent() {
  const spin = useRef<Group>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    const group = spin.current;
    if (!group) return;
    const step = Math.min(delta, MAX_FRAME_DELTA);
    time.current += step;
    group.rotation.y += step * SPIN_RAD_PER_SECOND;
    group.position.y = Math.sin(time.current * 0.6 * MOTION_SPEED) * 0.06;
  });

  return (
    <>
      <StudioLights intensity={1.05} />
      <group rotation={[0, 0, -0.75]}>
        <group ref={spin}>
          <Capsule colors={['green', 'white']} scale={2.1} floating={false} />
        </group>
      </group>
    </>
  );
}
