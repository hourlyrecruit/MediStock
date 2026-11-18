import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { MathUtils, type Group } from 'three';
import { Bottle } from './objects/Bottle';
import { Capsule, type CapsuleProps } from './objects/Capsule';
import { MedicalCross } from './objects/MedicalCross';
import { StudioLights } from './rigs/StudioLights';
import { palette } from './rigs/materials';
import { usePointer } from './rigs/pointer';
import { MAX_FRAME_DELTA, MOTION_SPEED } from './rigs/useFloat';

const PARALLAX = 0.15;
const DESKTOP_MIN_WIDTH = 768;
const CAMERA_Z = 8;
const CAMERA_Y = 1.2;

const CAPSULES: readonly CapsuleProps[] = [
  { colors: ['green', 'white'], position: [-1.35, 1.05, 0.4], rotation: [0.4, 0.2, 0.9], phase: 0 },
  { colors: ['stone', 'white'], position: [1.55, -1.35, 0.6], rotation: [-0.3, 0.5, -0.6], phase: 1.1 },
  { colors: ['white', 'stone'], position: [-0.55, -1.25, 0.9], rotation: [0.2, -0.4, 1.3], phase: 2.3 },
  { colors: ['grey', 'white'], position: [0.15, 1.7, 0.2], rotation: [0.6, 0.1, -0.35], phase: 3.4 },
  { colors: ['green', 'stone'], position: [-1.75, -0.35, -0.7], rotation: [-0.5, 0.3, 0.45], phase: 4.2 },
  { colors: ['grey', 'stone'], position: [2.55, -0.15, -1.0], rotation: [0.3, -0.2, 1.1], phase: 5.1 },
];

export function WelcomeScene() {
  const rig = useRef<Group>(null);
  const time = useRef(0);
  const pointer = usePointer();
  const viewport = useThree((state) => state.viewport);
  const size = useThree((state) => state.size);
  const isDesktop = size.width >= DESKTOP_MIN_WIDTH;
  const offsetX = isDesktop ? viewport.width * 0.21 : 0;
  const offsetY = isDesktop ? 0 : -viewport.height * 0.04;
  const fit = isDesktop
    ? Math.min(1, viewport.height / 6.2, viewport.width / 10.5)
    : Math.min(0.7, viewport.width / 6.6);

  useFrame((state, delta) => {
    const group = rig.current;
    if (!group) return;
    time.current += Math.min(delta, MAX_FRAME_DELTA) * MOTION_SPEED;
    const ease = 1 - Math.pow(0.002, Math.min(delta, MAX_FRAME_DELTA));
    const p = pointer.current;
    group.rotation.y = MathUtils.lerp(group.rotation.y, p.x * PARALLAX, ease);
    group.rotation.x = MathUtils.lerp(group.rotation.x, -p.y * PARALLAX, ease);
    const t = time.current;
    state.camera.position.set(Math.sin(t * 0.11) * 0.25, CAMERA_Y + Math.sin(t * 0.07) * 0.15, CAMERA_Z);
    state.camera.lookAt(offsetX * 0.15, 0, 0);
  });

  return (
    <>
      <StudioLights />
      <group position={[offsetX, offsetY, 0]} scale={fit}>
        <group ref={rig}>
          <Bottle position={[0.35, -0.15, 0]} rotation={[0.08, -0.5, -0.12]} phase={0.6} />
          <MedicalCross position={[1.75, 1.25, -0.8]} rotation={[0.15, -0.45, 0.2]} scale={0.95} phase={2.7} />
          {CAPSULES.map((capsule, index) => (
            <Capsule key={index} {...capsule} />
          ))}
        </group>
        <ContactShadows
          position={[0, -1.95, 0]}
          opacity={0.45}
          scale={7}
          blur={2.2}
          far={4}
          resolution={256}
          color={palette.ink}
        />
      </group>
    </>
  );
}
