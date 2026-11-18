import type { InventoryState } from '@/data/types';
import { hasInventory, restoreInventory, useInventoryStore } from '@/data/store/inventoryStore';
import { useSessionStore } from '@/data/store/sessionStore';
import { assembleInventory } from './assemble';
import { apiConfig } from './config';
import { inventoryApi } from './inventoryApi';

export async function fetchInventory(today: Date = new Date()): Promise<InventoryState> {
  const [reference, settings, medicines, batches, transactions] = await Promise.all([
    inventoryApi.getReferenceData(),
    inventoryApi.getSettings(),
    inventoryApi.listMedicines(),
    inventoryApi.listBatches(),
    inventoryApi.listTransactions(),
  ]);
  return assembleInventory({ reference, settings, medicines, batches, transactions }, today);
}

function cachedInventory() {
  if (apiConfig.mode !== 'mock') return null;
  const state = useInventoryStore.getState();
  return hasInventory(state) ? restoreInventory(state) : null;
}

let inflight: Promise<void> | null = null;

async function load(force: boolean) {
  useSessionStore.setState({ status: 'loading', error: null });
  try {
    const cached = force ? null : cachedInventory();
    const [user, inventory] = await Promise.all([
      inventoryApi.getCurrentUser(),
      cached ? Promise.resolve(cached) : fetchInventory(),
    ]);
    useInventoryStore.setState(inventory, true);
    useSessionStore.setState({ status: 'ready', user, error: null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not load data';
    useSessionStore.setState({ status: 'error', error: message });
    throw error;
  }
}

export function loadAppData(options: { force?: boolean } = {}): Promise<void> {
  const force = options.force ?? false;
  if (!force && useSessionStore.getState().status === 'ready') return Promise.resolve();
  if (inflight && !force) return inflight;
  const run = load(force).finally(() => {
    if (inflight === run) inflight = null;
  });
  inflight = run;
  return run;
}
