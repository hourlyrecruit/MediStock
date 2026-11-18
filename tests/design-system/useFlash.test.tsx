import { act, renderHook } from '@testing-library/react';
import { flashClass, useFlash } from '@/design-system/motion/useFlash';

describe('useFlash', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('flashes the same id again when it is triggered twice in a row', () => {
    const { result, rerender } = renderHook(({ ids }) => useFlash(ids, 1000), {
      initialProps: { ids: [] as string[] },
    });
    expect(result.current.size).toBe(0);

    rerender({ ids: ['bat_1'] });
    const first = result.current;
    expect(first.has('bat_1')).toBe(true);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.has('bat_1')).toBe(false);

    rerender({ ids: ['bat_1'] });
    const second = result.current;
    expect(second.has('bat_1')).toBe(true);
    expect(second.generation).toBe(first.generation + 1);
    expect(flashClass(second, 'bat_1')).not.toBe(flashClass(first, 'bat_1'));
  });

  it('restarts the animation when re-triggered before the previous flash ends', () => {
    const { result, rerender } = renderHook(({ ids }) => useFlash(ids, 1000), {
      initialProps: { ids: ['bat_1'] },
    });
    rerender({ ids: ['bat_1'] });
    const firstClass = flashClass(result.current, 'bat_1');
    rerender({ ids: ['bat_1'] });
    expect(flashClass(result.current, 'bat_1')).not.toBe(firstClass);
  });

  it('returns no class for ids that are not flashing', () => {
    const { result } = renderHook(() => useFlash(['bat_1']));
    expect(flashClass(result.current, 'bat_2')).toBeUndefined();
  });
});
