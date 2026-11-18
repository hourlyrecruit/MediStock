import type { InventoryState } from '@/data/types';

export type MemoKey = readonly unknown[];

interface Entry<R> {
  key: MemoKey;
  value: R;
}

function sameKey(a: MemoKey, b: MemoKey) {
  return a.length === b.length && a.every((value, index) => Object.is(value, b[index]));
}

export function memoizeByRef<A extends unknown[], R>(
  fn: (...args: A) => R,
  keyOf: (...args: A) => MemoKey,
  size = 8,
): (...args: A) => R {
  const cache: Entry<R>[] = [];
  return (...args: A) => {
    const key = keyOf(...args);
    const index = cache.findIndex((entry) => sameKey(entry.key, key));
    if (index >= 0) {
      const [entry] = cache.splice(index, 1) as [Entry<R>];
      cache.unshift(entry);
      return entry.value;
    }
    const value = fn(...args);
    cache.unshift({ key, value });
    if (cache.length > size) cache.pop();
    return value;
  };
}

export function stateKey(state: InventoryState, today?: Date): unknown[] {
  return [
    state.medicines,
    state.batches,
    state.transactions,
    state.settings.expiryAlertDays,
    today?.getTime(),
  ];
}
