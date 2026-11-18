import { useRef } from 'react';
import type { Group } from 'three';
import { getGeometries } from '../rigs/geometries';
import { getMaterials } from '../rigs/materials';
import { useBaseTransform, type FloatingObjectProps } from '../rigs/transform';
import { useFloat } from '../rigs/useFloat';

export function MedicalCross({ position, rotation, scale = 1, phase = 0, floating = true }: FloatingObjectProps) {
  const ref = useRef<Group>(null);
  const base = useBaseTransform(position, rotation);
  const geometries = getGeometries();
  const materials = getMaterials();
  useFloat(ref, base, { phase, enabled: floating, amplitude: 0.1, speed: 0.6, wobble: 0.1 });

  return (
    <group ref={ref} position={base.position} rotation={base.rotation} scale={scale}>
      <mesh geometry={geometries.cross} material={materials.cross} />
    </group>
  );
}
