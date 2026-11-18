import { useCallback, useState } from 'react';
import { z } from 'zod';
import { useUrlState } from '@/shared/hooks';
import { DEFAULT_TABLE_STATE, type TableState } from '@/shared/table';

function buildSchema(defaults: TableState) {
  return z.object({
    q: z.string().default(defaults.q),
    sort: defaults.sort ? z.string().default(defaults.sort) : z.string().optional(),
    dir: z.enum(['asc', 'desc']).default(defaults.dir),
    page: z.coerce.number().int().min(1).default(1),
    size: z.coerce.number().int().min(1).max(200).default(defaults.size),
  });
}

export function useDataTableState(defaults: Partial<TableState> = {}) {
  const [resolved] = useState<TableState>(() => ({ ...DEFAULT_TABLE_STATE, ...defaults }));
  const [schema] = useState(() => buildSchema(resolved));
  const [urlState, setUrlState] = useUrlState(schema);

  const setState = useCallback(
    (patch: Partial<TableState>) => {
      const clean = { ...patch };
      for (const key of Object.keys(patch) as (keyof TableState)[]) {
        const value = patch[key];
        const isDefault = key === 'page' ? value === 1 : value === resolved[key];
        if (isDefault || value === '') clean[key] = undefined;
      }
      setUrlState(clean);
    },
    [resolved, setUrlState],
  );

  const state: TableState = urlState;
  return [state, setState] as const;
}
