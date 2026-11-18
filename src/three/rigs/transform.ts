import { useMemo } from 'react';
import { Euler, Vector3 } from 'three';

export type Vec3 = readonly [number, number, number];

export interface FloatingObjectProps {
  position?: Vec3;
  rotation?: Vec3;
  scale?: number;
  phase?: number;
  floating?: boolean;
}

const ORIGIN: Vec3 = [0, 0, 0];

export function useBaseTransform(position: Vec3 = ORIGIN, rotation: Vec3 = ORIGIN) {
  const [px, py, pz] = position;
  const [rx, ry, rz] = rotation;
  return useMemo(
    () => ({ position: new Vector3(px, py, pz), rotation: new Euler(rx, ry, rz) }),
    [px, py, pz, rx, ry, rz],
  );
}
