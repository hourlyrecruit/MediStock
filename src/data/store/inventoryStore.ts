import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PersistStorage, StorageValue } from 'zustand/middleware';
import type { InventoryState } from '@/data/types';
import { apiConfig } from '@/data/api/config';
import { assertInvariants } from '@/data/services/invariants';
import { parseInventoryState } from './schema';

export const INVENTORY_STORAGE_KEY = 'medistock:inventory';
export const INVENTORY_STORAGE_VERSION = 2;

export function emptyInventory(): InventoryState {
  return {
    schemaVersion: 2,
    medicines: {},
    batches: {},
    transactions: [],
    settings: { pharmacyName: '', currency: 'INR', expiryAlertDays: 30 },
    reference: { categories: [] },
    seededOn: '',
  };
}

export function restoreInventory(persisted: unknown): InventoryState | null {
  const state = parseInventoryState(persisted);
  if (!state) return null;
  try {
    assertInvariants(state);
    return state;
  } catch {
    return null;
  }
}

export function hasInventory(state: InventoryState) {
  return state.seededOn !== '';
}

export const inventoryStorage: PersistStorage<InventoryState> = {
  getItem: (name) => {
    try {
      const raw = localStorage.getItem(name);
      if (!raw) return null;
      const value: StorageValue<InventoryState> = JSON.parse(raw);
      return value;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    if (!hasInventory(value.state)) return;
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch {
      return;
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      return;
    }
  },
};

const memoryStorage: PersistStorage<InventoryState> = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const useInventoryStore = create<InventoryState>()(
  persist(() => emptyInventory(), {
    name: INVENTORY_STORAGE_KEY,
    version: INVENTORY_STORAGE_VERSION,
    storage: apiConfig.mode === 'mock' ? inventoryStorage : memoryStorage,
    migrate: (persisted) => restoreInventory(persisted) ?? emptyInventory(),
    merge: (persisted, current) => restoreInventory(persisted) ?? current,
  }),
);
