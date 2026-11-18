import { useRef } from 'react';
import type { Group } from 'three';
import { getGeometries } from '../rigs/geometries';
import { getMaterials, type CapsuleTone } from '../rigs/materials';
import { useBaseTransform, type FloatingObjectProps } from '../rigs/transform';
import { useFloat } from '../rigs/useFloat';

export interface CapsuleProps extends FloatingObjectProps {
  colors?: readonly [CapsuleTone, CapsuleTone];
}

export function Capsule({
  colors = ['green', 'white'],
  position,
  rotation,
  scale = 1,
  phase = 0,
  floating = true,
}: CapsuleProps) {
  const ref = useRef<Group>(null);
  const base = useBaseTransform(position, rotation);
  const geometries = getGeometries();
  const materials = getMaterials();
  useFloat(ref, base, { phase, enabled: floating, amplitude: 0.14, speed: 0.7 });

  return (
    <group ref={ref} position={base.position} rotation={base.rotation} scale={scale}>
      <mesh geometry={geometries.capsuleBody} material={materials.capsule[colors[1]]} />
      <mesh
        geometry={geometries.capsuleCap}
        material={materials.capsule[colors[0]]}
        rotation={[Math.PI, 0, 0]}
      />
    </group>
  );
}
