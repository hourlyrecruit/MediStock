import { Color, MeshPhysicalMaterial, MeshStandardMaterial } from 'three';

export const palette = {
  green: '#1f6b4f',
  greenTint: '#eef5f1',
  white: '#f7f6f3',
  stone: '#d6d3ce',
  grey: '#a8a29e',
  ink: '#161616',
  amber: '#76563a',
  paper: '#fafaf8',
  light: '#fffdf8',
  coolLight: '#f4f4f2',
  studio: '#2a2a28',
} as const;

export type CapsuleTone = 'green' | 'white' | 'stone' | 'grey';

interface SceneMaterials {
  capsule: Record<CapsuleTone, MeshPhysicalMaterial>;
  amberGlass: MeshPhysicalMaterial;
  cap: MeshPhysicalMaterial;
  label: MeshStandardMaterial;
  labelBand: MeshStandardMaterial;
  cross: MeshPhysicalMaterial;
}

let cache: SceneMaterials | null = null;

const glossy = (color: string, roughness = 0.25) =>
  new MeshPhysicalMaterial({
    color: new Color(color),
    roughness,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.14,
  });

export function getMaterials(): SceneMaterials {
  if (cache) return cache;
  cache = {
    capsule: {
      green: glossy(palette.green),
      white: glossy(palette.white, 0.28),
      stone: glossy(palette.stone),
      grey: glossy(palette.grey),
    },
    amberGlass: new MeshPhysicalMaterial({
      color: new Color(palette.amber),
      roughness: 0.16,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
    }),
    cap: new MeshPhysicalMaterial({
      color: new Color(palette.white),
      roughness: 0.45,
      clearcoat: 0.35,
      clearcoatRoughness: 0.3,
    }),
    label: new MeshStandardMaterial({ color: new Color(palette.paper), roughness: 0.85 }),
    labelBand: new MeshStandardMaterial({ color: new Color(palette.green), roughness: 0.6 }),
    cross: new MeshPhysicalMaterial({
      color: new Color(palette.green),
      roughness: 0.38,
      clearcoat: 0.6,
      clearcoatRoughness: 0.25,
    }),
  };
  return cache;
}
