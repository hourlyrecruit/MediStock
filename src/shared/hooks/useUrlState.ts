import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import type { z } from 'zod';

export function useUrlState<S extends z.ZodObject>(schema: S) {
  const [searchParams, setSearchParams] = useSearchParams();

  const state = useMemo(() => {
    const raw = Object.fromEntries(searchParams.entries());
    const parsed = schema.safeParse(raw);
    if (parsed.success) return parsed.data;
    const fallback: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(raw)) {
      const field = schema.shape[key];
      if (field && (field as z.ZodType).safeParse(value).success) fallback[key] = value;
    }
    return schema.parse(fallback);
  }, [schema, searchParams]) as z.infer<S>;

  const setState = useCallback(
    (patch: Partial<z.infer<S>>, options?: { resetPage?: boolean }) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(patch)) {
            if (value === undefined || value === null || value === '') next.delete(key);
            else next.set(key, String(value));
          }
          if (options?.resetPage !== false && !('page' in patch)) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return [state, setState] as const;
}
