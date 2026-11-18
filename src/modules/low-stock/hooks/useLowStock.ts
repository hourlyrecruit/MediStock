import { useCallback, useMemo } from 'react';
import { z } from 'zod';
import { selectLowStock, useInventory, type MedicineCategory } from '@/data';
import { useUrlState } from '@/shared/hooks';

const filtersSchema = z.object({
  category: z.string().min(1).optional(),
});

export function useLowStock() {
  const [state, setState] = useUrlState(filtersSchema);
  const all = useInventory(selectLowStock);
  const category = state.category;

  const rows = useMemo(
    () => (category === undefined ? all : all.filter((view) => view.category === category)),
    [all, category],
  );

  const setCategory = useCallback(
    (next: MedicineCategory | undefined) => setState({ category: next }),
    [setState],
  );

  return { rows, category, setCategory };
}
