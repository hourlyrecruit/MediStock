import { useCallback, useState } from 'react';
import { DEFAULT_TABLE_STATE, type TableState } from '@/shared/table';

export function useLocalTableState(defaults: Partial<TableState> = {}) {
  const [state, setState] = useState<TableState>(() => ({ ...DEFAULT_TABLE_STATE, ...defaults }));
  const update = useCallback((patch: Partial<TableState>) => {
    setState((current) => ({ ...current, ...patch, page: patch.page ?? 1 }));
  }, []);
  return [state, update] as const;
}
