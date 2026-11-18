import {
  CylinderGeometry,
  ExtrudeGeometry,
  LatheGeometry,
  Shape,
  Vector2,
  type BufferGeometry,
} from 'three';

const RADIAL_SEGMENTS = 36;

export const CAPSULE_RADIUS = 0.18;
export const CAPSULE_HALF_LENGTH = 0.3;

function halfCapsuleProfile(radius: number, length: number, capSteps: number): Vector2[] {
  const points: Vector2[] = [];
  for (let i = 0; i <= capSteps; i += 1) {
    const a = (i / capSteps) * (Math.PI / 2);
    points.push(new Vector2(Math.sin(a) * radius, -length - Math.cos(a) * radius));
  }
  points.push(new Vector2(radius, 0));
  points.push(new Vector2(radius * 0.96, 0.002));
  points.push(new Vector2(0, 0.002));
  return points;
}

function roundedPolygon(vertices: readonly (readonly [number, number])[], radius: number): Shape {
  const shape = new Shape();
  const count = vertices.length;
  const at = (i: number) => {
    const v = vertices[((i % count) + count) % count];
    if (!v) throw new Error('vertex out of range');
    return new Vector2(v[0], v[1]);
  };
  for (let i = 0; i < count; i += 1) {
    const prev = at(i - 1);
    const curr = at(i);
    const next = at(i + 1);
    const toPrev = prev.clone().sub(curr).normalize().multiplyScalar(radius);
    const toNext = next.clone().sub(curr).normalize().multiplyScalar(radius);
    const start = curr.clone().add(toPrev);
    const end = curr.clone().add(toNext);
    if (i === 0) shape.moveTo(start.x, start.y);
    else shape.lineTo(start.x, start.y);
    shape.quadraticCurveTo(curr.x, curr.y, end.x, end.y);
  }
  shape.closePath();
  return shape;
}

function crossShape(arm: number, half: number, radius: number): Shape {
  const a = arm / 2;
  const h = half;
  return roundedPolygon(
    [
      [-a, h],
      [a, h],
      [a, a],
      [h, a],
      [h, -a],
      [a, -a],
      [a, -h],
      [-a, -h],
      [-a, -a],
      [-h, -a],
      [-h, a],
      [-a, a],
    ],
    radius,
  );
}

function bottleProfile(): Vector2[] {
  return [
    new Vector2(0, 0),
    new Vector2(0.44, 0),
    new Vector2(0.5, 0.02),
    new Vector2(0.52, 0.08),
    new Vector2(0.52, 1.05),
    new Vector2(0.5, 1.16),
    new Vector2(0.44, 1.24),
    new Vector2(0.34, 1.3),
    new Vector2(0.3, 1.34),
    new Vector2(0.3, 1.46),
    new Vector2(0, 1.46),
  ];
}

interface SharedGeometries {
  capsuleBody: BufferGeometry;
  capsuleCap: BufferGeometry;
  bottleBody: BufferGeometry;
  bottleCap: BufferGeometry;
  label: BufferGeometry;
  labelBand: BufferGeometry;
  cross: BufferGeometry;
}

let cache: SharedGeometries | null = null;

export function getGeometries(): SharedGeometries {
  if (cache) return cache;
  const cross = new ExtrudeGeometry(crossShape(0.42, 0.62, 0.1), {
    depth: 0.22,
    bevelEnabled: true,
    bevelThickness: 0.07,
    bevelSize: 0.06,
    bevelSegments: 5,
    curveSegments: 8,
  });
  cross.center();
  cache = {
    capsuleBody: new LatheGeometry(halfCapsuleProfile(CAPSULE_RADIUS, CAPSULE_HALF_LENGTH, 10), RADIAL_SEGMENTS),
    capsuleCap: new LatheGeometry(
      halfCapsuleProfile(CAPSULE_RADIUS * 1.045, CAPSULE_HALF_LENGTH * 1.08, 10),
      RADIAL_SEGMENTS,
    ),
    bottleBody: new LatheGeometry(bottleProfile(), 48),
    bottleCap: new CylinderGeometry(0.35, 0.35, 0.3, 48, 1, false),
    label: new CylinderGeometry(0.527, 0.527, 0.58, 48, 1, true, -1.25, 2.5),
    labelBand: new CylinderGeometry(0.53, 0.53, 0.12, 48, 1, true, -1.25, 2.5),
    cross,
  };
  return cache;
}
