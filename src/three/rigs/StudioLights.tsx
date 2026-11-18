import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import {
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PMREMGenerator,
  RingGeometry,
  Scene,
  type BufferGeometry,
} from 'three';
import { palette } from './materials';

interface StudioLightsProps {
  intensity?: number;
}

interface Softbox {
  geometry: 'rect' | 'ring';
  color: string;
  intensity: number;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

const SOFTBOXES: readonly Softbox[] = [
  { geometry: 'rect', color: palette.light, intensity: 2.2, position: [0, 5, -1], rotation: [Math.PI / 2, 0, 0], scale: [10, 4, 1] },
  { geometry: 'rect', color: palette.light, intensity: 1.4, position: [-5, 1.5, 2], rotation: [0, Math.PI / 2, 0], scale: [6, 2.5, 1] },
  { geometry: 'rect', color: palette.coolLight, intensity: 0.9, position: [5, 1, 1], rotation: [0, -Math.PI / 2, 0], scale: [5, 2, 1] },
  { geometry: 'ring', color: palette.light, intensity: 0.6, position: [2, 2, 6], rotation: [0, Math.PI, 0], scale: [3, 3, 1] },
  { geometry: 'rect', color: palette.coolLight, intensity: 0.4, position: [0, -4, 0], rotation: [-Math.PI / 2, 0, 0], scale: [10, 10, 1] },
];

function StudioEnvironment() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const room = new Scene();
    room.background = new Color(palette.studio);
    const geometries: Record<Softbox['geometry'], BufferGeometry> = {
      rect: new PlaneGeometry(1, 1),
      ring: new RingGeometry(0.5, 1, 48),
    };
    const materials = SOFTBOXES.map((box) => {
      const material = new MeshBasicMaterial({
        color: new Color(box.color).multiplyScalar(box.intensity),
        side: DoubleSide,
        toneMapped: false,
      });
      const mesh = new Mesh(geometries[box.geometry], material);
      mesh.position.set(...box.position);
      mesh.rotation.set(...box.rotation);
      mesh.scale.set(...box.scale);
      room.add(mesh);
      return material;
    });
    const pmrem = new PMREMGenerator(gl);
    const target = pmrem.fromScene(room, 0.04);
    scene.environment = target.texture;
    invalidate();
    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      materials.forEach((material) => material.dispose());
      Object.values(geometries).forEach((geometry) => geometry.dispose());
    };
  }, [gl, scene, invalidate]);

  return null;
}

export function StudioLights({ intensity = 1 }: StudioLightsProps) {
  return (
    <>
      <ambientLight intensity={0.7 * intensity} color={palette.light} />
      <directionalLight position={[4, 6, 5]} intensity={1.8 * intensity} color={palette.light} />
      <directionalLight position={[-6, 2, 3]} intensity={0.45 * intensity} color={palette.coolLight} />
      <directionalLight position={[0, 3, -6]} intensity={0.7 * intensity} color={palette.coolLight} />
      <StudioEnvironment />
    </>
  );
}
