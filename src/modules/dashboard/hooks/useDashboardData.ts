import {
  selectCategoryDistribution,
  selectExpiringSoon,
  selectKpis,
  selectLowStock,
  selectMonthlyAdditions,
  useInventory,
} from '@/data';
import type { InventoryState } from '@/data';

export const DASHBOARD_TABLE_LIMIT = 5;

const pickKpis = (state: InventoryState, today: Date) => selectKpis(state, today);
const pickLowStock = (state: InventoryState, today: Date) => selectLowStock(state, today);
const pickExpiringSoon = (state: InventoryState, today: Date) =>
  selectExpiringSoon(state, today, { includeToday: true });
const pickCategories = (state: InventoryState, today: Date) =>
  selectCategoryDistribution(state, today);
const pickMonthly = (state: InventoryState, today: Date) => selectMonthlyAdditions(state, today, 6);
const pickSettings = (state: InventoryState) => state.settings;

export function useKpis() {
  return useInventory(pickKpis);
}

export function useLowStock() {
  return useInventory(pickLowStock);
}

export function useUpcomingExpiries() {
  return useInventory(pickExpiringSoon);
}

export function useCategoryDistribution() {
  return useInventory(pickCategories);
}

export function useMonthlyAdditions() {
  return useInventory(pickMonthly);
}

export function useSettings() {
  return useInventory(pickSettings);
}
