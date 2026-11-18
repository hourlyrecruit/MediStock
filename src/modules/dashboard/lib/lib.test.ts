import { selectCategoryDistribution } from '@/data';
import { demoInventory } from '@/data/testing/demo';
import { toDonutSlices } from './categorySlices';
import { greetingFor } from './greeting';

describe('greetingFor', () => {
  it.each([
    [4, 'Good Evening'],
    [5, 'Good Morning'],
    [11, 'Good Morning'],
    [12, 'Good Afternoon'],
    [16, 'Good Afternoon'],
    [17, 'Good Evening'],
    [23, 'Good Evening'],
  ])('at %i:00 says %s', (hour, expected) => {
    expect(greetingFor(new Date(2026, 9, 31, hour))).toBe(expected);
  });
});

describe('toDonutSlices', () => {
  it('keeps totals, sorts by units and folds the tail into Other', () => {
    const today = new Date(2026, 9, 31);
    const distribution = selectCategoryDistribution(demoInventory(today), today);
    const slices = toDonutSlices(distribution);
    const total = distribution.reduce((sum, slice) => sum + slice.usableUnits, 0);
    expect(slices.reduce((sum, slice) => sum + slice.units, 0)).toBe(total);
    expect(slices.length).toBeLessThanOrEqual(7);
    const head = slices.filter((slice) => slice.key !== 'other');
    for (let index = 1; index < head.length; index += 1) {
      expect(head[index - 1]!.units).toBeGreaterThanOrEqual(head[index]!.units);
    }
    expect(new Set(slices.map((slice) => slice.color)).size).toBe(slices.length);
  });
});
