import { useMemo } from 'react';
import type { CurrentUser, InventoryState, MedicineCategory } from '@/data/types';
import { useToday } from '@/shared/hooks';
import { selectCategoryNames } from './selectors/charts';
import { useInventoryStore } from './store/inventoryStore';
import { useSessionStore } from './store/sessionStore';

export { inventoryActions, useInventoryActions, type InventoryActions } from './actions';

export function useInventory<T>(select: (state: InventoryState, today: Date) => T): T {
  const today = useToday();
  const selector = useMemo(() => {
    let last: { state: InventoryState; value: T } | null = null;
    return (state: InventoryState) => {
      if (last && last.state === state) return last.value;
      const value = select(state, today);
      last = { state, value };
      return value;
    };
  }, [select, today]);
  return useInventoryStore(selector);
}

export function useCategories(): MedicineCategory[] {
  return useInventoryStore(selectCategoryNames);
}

export function useCurrentUser(): CurrentUser | null {
  return useSessionStore((state) => state.user);
}
