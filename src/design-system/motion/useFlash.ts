import { useEffect, useMemo, useState } from 'react';

export interface FlashSet extends ReadonlySet<string> {
  readonly generation: number;
}

function createFlashSet(ids: Iterable<string>, generation: number): FlashSet {
  return Object.assign(new Set(ids), { generation });
}

const EMPTY = createFlashSet([], 0);

export function flashClass(flashIds: ReadonlySet<string> | undefined, id: string) {
  if (!flashIds?.has(id)) return undefined;
  const generation = (flashIds as Partial<FlashSet>).generation ?? 0;
  return generation % 2 === 0 ? 'animate-flash' : 'animate-flash-alt';
}

export function useFlash(ids: readonly string[] | null | undefined, duration = 1200): FlashSet {
  const [state, setState] = useState<{
    source: readonly string[] | null | undefined;
    generation: number;
    done: boolean;
  }>({ source: ids, generation: 0, done: true });

  if (ids !== state.source) {
    const empty = !ids || ids.length === 0;
    setState({
      source: ids,
      generation: empty ? state.generation : state.generation + 1,
      done: empty,
    });
  }

  useEffect(() => {
    if (state.done) return;
    const timer = window.setTimeout(() => setState((s) => ({ ...s, done: true })), duration);
    return () => window.clearTimeout(timer);
  }, [state.done, state.generation, duration]);

  return useMemo(
    () => (state.done || !state.source ? EMPTY : createFlashSet(state.source, state.generation)),
    [state],
  );
}
