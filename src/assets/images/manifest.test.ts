import { describe, expect, it } from 'vitest';
import { imageKeys, images } from './manifest';

const EXPECTED_KEYS = ['heroPharmacy', 'shelves', 'capsules', 'supplies', 'dashboardTile', 'bottleStill'];

describe('image manifest', () => {
  it('exposes every planned slot', () => {
    expect([...imageKeys].sort()).toEqual([...EXPECTED_KEYS].sort());
  });

  it.each(EXPECTED_KEYS)('%s has a complete, consistent entry', (key) => {
    const entry = images[key as keyof typeof images];
    expect(entry.key).toBe(key);
    expect(entry.width).toBeGreaterThan(0);
    expect(entry.height).toBeGreaterThan(0);
    expect(entry.alt.length).toBeGreaterThan(10);
    expect(entry.credit.photographer).not.toBe('');
    expect(entry.credit.licence).not.toBe('');
    expect(entry.src.avif).toMatch(/\s\d+w/);
    expect(entry.src.webp).toMatch(/\s\d+w/);
    expect(entry.src.jpgSrcset).toMatch(/\s\d+w/);
    expect(entry.src.jpg).not.toBe('');
    expect(entry.src.placeholder).toMatch(/^data:image\/webp;base64,/);
  });

  it('keeps the hero at full 2400px width', () => {
    expect(images.heroPharmacy.width).toBe(2400);
    expect(images.heroPharmacy.src.avif).toContain('2400w');
  });
});
