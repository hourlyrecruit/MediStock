import { demoInventory } from '@/data/testing/demo';
import { FIXED_TODAY } from '@/data/testing/fixtures';
import {
  INVENTORY_STORAGE_KEY,
  INVENTORY_STORAGE_VERSION,
  emptyInventory,
  hasInventory,
  inventoryStorage,
  restoreInventory,
  useInventoryStore,
} from './inventoryStore';
import { parseInventoryState } from './schema';

function storedValue() {
  const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as { state: unknown; version: number }) : null;
}

async function rehydrate() {
  await useInventoryStore.persist.rehydrate();
  return useInventoryStore.getState();
}

describe('inventory persistence', () => {
  it('validates persisted state', () => {
    const seed = demoInventory(FIXED_TODAY);
    expect(parseInventoryState(JSON.parse(JSON.stringify(seed)))).toEqual(seed);
    expect(parseInventoryState({ ...seed, schemaVersion: 1 })).toBeNull();
    expect(parseInventoryState({ ...seed, reference: { categories: [] } })).toBeNull();
    expect(restoreInventory(seed)).toEqual(seed);
    expect(restoreInventory(null)).toBeNull();
    const broken = structuredClone(seed);
    broken.batches.bat_01!.quantity += 1;
    expect(restoreInventory(broken)).toBeNull();
  });

  it('starts empty until data is loaded', () => {
    const empty = emptyInventory();
    expect(hasInventory(empty)).toBe(false);
    expect(restoreInventory(empty)).toBeNull();
    expect(hasInventory(demoInventory(FIXED_TODAY))).toBe(true);
  });

  it('restores valid stored data', async () => {
    const seed = demoInventory(FIXED_TODAY);
    const custom = { ...seed, settings: { ...seed.settings, pharmacyName: 'Stored Pharmacy' } };
    localStorage.setItem(
      INVENTORY_STORAGE_KEY,
      JSON.stringify({ state: custom, version: INVENTORY_STORAGE_VERSION }),
    );
    const state = await rehydrate();
    expect(state.settings.pharmacyName).toBe('Stored Pharmacy');
  });

  it('keeps the current state on corrupt JSON', async () => {
    const current = demoInventory(new Date(2020, 0, 1));
    useInventoryStore.setState(current, true);
    localStorage.setItem(INVENTORY_STORAGE_KEY, '{not json');
    const state = await rehydrate();
    expect(state).toEqual(current);
    expect(state.seededOn).toBe('2020-01-01');
  });

  it('keeps the current state when stored data fails validation', async () => {
    const current = demoInventory(new Date(2021, 5, 1));
    useInventoryStore.setState(current, true);
    localStorage.setItem(
      INVENTORY_STORAGE_KEY,
      JSON.stringify({ state: { medicines: 'nope' }, version: INVENTORY_STORAGE_VERSION }),
    );
    expect(await rehydrate()).toEqual(current);
  });

  it('drops data persisted by older versions', async () => {
    const current = demoInventory(FIXED_TODAY);
    useInventoryStore.setState(current, true);
    localStorage.setItem(
      INVENTORY_STORAGE_KEY,
      JSON.stringify({ state: { ...current, schemaVersion: 1 }, version: 1 }),
    );
    expect(await rehydrate()).toEqual(current);
  });

  it('writes to storage after changes but never persists an empty inventory', () => {
    const seed = demoInventory(FIXED_TODAY);
    useInventoryStore.setState(seed, true);
    expect(storedValue()?.state).toEqual(seed);
    localStorage.clear();
    useInventoryStore.setState(emptyInventory(), true);
    expect(storedValue()).toBeNull();
  });

  it('tolerates storage failures', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() =>
      inventoryStorage.setItem('x', { state: demoInventory(FIXED_TODAY), version: 2 }),
    ).not.toThrow();
    setItem.mockRestore();
    localStorage.setItem('x', '1');
    inventoryStorage.removeItem('x');
    expect(localStorage.getItem('x')).toBeNull();
    expect(inventoryStorage.getItem('missing')).toBeNull();
  });
});
