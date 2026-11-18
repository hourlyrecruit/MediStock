import { useRef } from 'react';
import type { Group } from 'three';
import { getGeometries } from '../rigs/geometries';
import { getMaterials } from '../rigs/materials';
import { useBaseTransform, type FloatingObjectProps } from '../rigs/transform';
import { useFloat } from '../rigs/useFloat';

export function Bottle({ position, rotation, scale = 1, phase = 0, floating = true }: FloatingObjectProps) {
  const ref = useRef<Group>(null);
  const base = useBaseTransform(position, rotation);
  const geometries = getGeometries();
  const materials = getMaterials();
  useFloat(ref, base, { phase, enabled: floating, amplitude: 0.08, speed: 0.55, wobble: 0.04 });

  return (
    <group ref={ref} position={base.position} rotation={base.rotation} scale={scale}>
      <group position={[0, -0.8, 0]}>
        <mesh geometry={geometries.bottleBody} material={materials.amberGlass} />
        <mesh geometry={geometries.bottleCap} material={materials.cap} position={[0, 1.58, 0]} />
        <mesh geometry={geometries.label} material={materials.label} position={[0, 0.58, 0]} />
        <mesh geometry={geometries.labelBand} material={materials.labelBand} position={[0, 0.52, 0]} />
      </group>
    </group>
  );
}
