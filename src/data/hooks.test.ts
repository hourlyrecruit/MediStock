import { act, renderHook } from '@testing-library/react';
import { demoInventory } from '@/data/testing/demo';
import { selectKpis, selectMedicineViews } from '@/data/selectors';
import { FIXED_TODAY, isoIn } from '@/data/testing/fixtures';
import type { InventoryState } from '@/data/types';
import { inventoryActions, useInventory, useInventoryActions } from './hooks';
import { useInventoryStore } from './store/inventoryStore';

describe('inventory hooks', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 31, 10, 30));
    useInventoryStore.setState(demoInventory(FIXED_TODAY), true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns stable actions', () => {
    const { result, rerender } = renderHook(() => useInventoryActions());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
    expect(first).toBe(inventoryActions);
  });

  it('selects with today and keeps references stable across renders', () => {
    const select = (state: InventoryState, today: Date) => selectKpis(state, today);
    const { result, rerender } = renderHook(() => useInventory(select));
    const first = result.current;
    expect(first.totalMedicines).toBe(25);
    rerender();
    expect(result.current).toBe(first);
  });

  it('does not re-render for unrelated changes when the selection is memoized', () => {
    let renders = 0;
    const select = (state: InventoryState, today: Date) => selectMedicineViews(state, today);
    renderHook(() => {
      renders += 1;
      return useInventory(select);
    });
    const before = renders;
    act(() => {
      inventoryActions.updateSettings({ pharmacyName: 'Renamed Pharmacy', expiryAlertDays: 30 });
    });
    expect(renders).toBe(before);
    act(() => {
      inventoryActions.updateSettings({ pharmacyName: 'Renamed Pharmacy', expiryAlertDays: 45 });
    });
    expect(renders).toBe(before + 1);
  });

  it('tolerates inline selectors that build new objects', () => {
    const { result } = renderHook(() =>
      useInventory((state) => ({ name: state.settings.pharmacyName })),
    );
    expect(result.current.name).toBe('GreenLeaf Pharmacy');
  });

  it('runs every action against the store', async () => {
    const { result } = renderHook(() => useInventory((state) => state));
    const created = inventoryActions.createMedicine({
      name: 'Hooked 10',
      genericName: 'Hookamine',
      category: 'Respiratory',
      manufacturer: 'Hook Labs',
      unitPrice: 10,
      minStockLevel: 5,
      description: '',
      isActive: true,
    });
    if (!created.ok) throw new Error(created.error.message);
    const id = created.value.medicine.id;
    expect(useInventoryStore.getState().medicines[id]).toBeDefined();

    const updated = inventoryActions.updateMedicine({
      ...created.value.medicine,
      name: 'Hooked 20',
    });
    expect(updated.ok).toBe(true);

    const added = inventoryActions.addBatch({
      medicineId: id,
      batchNumber: 'HK-1',
      quantity: 20,
      receivedDate: isoIn(0),
      expiryDate: isoIn(100),
    });
    if (!added.ok) throw new Error(added.error.message);
    const batchId = added.value.batch.id;

    expect(inventoryActions.receiveStock({ batchId, quantity: 5, date: isoIn(0) }).ok).toBe(true);
    expect(
      inventoryActions.adjustStock({
        batchId,
        direction: 'DECREASE',
        quantity: 3,
        reason: 'DAMAGED',
      }).ok,
    ).toBe(true);
    expect(useInventoryStore.getState().batches[batchId]?.quantity).toBe(22);

    const failed = inventoryActions.adjustStock({
      batchId,
      direction: 'DECREASE',
      quantity: 999,
      reason: 'DAMAGED',
    });
    expect(failed.ok).toBe(false);
    expect(useInventoryStore.getState().batches[batchId]?.quantity).toBe(22);

    const toggled = inventoryActions.setMedicineActive(id, false);
    expect(toggled.ok && toggled.value.previous).toBe(true);
    expect(inventoryActions.deleteMedicine(id).ok).toBe(false);

    const blank = inventoryActions.createMedicine({
      name: 'Blank 1',
      genericName: 'Blankamine',
      category: 'Respiratory',
      manufacturer: 'Hook Labs',
      unitPrice: 1,
      minStockLevel: 0,
      description: '',
      isActive: true,
    });
    if (!blank.ok) throw new Error(blank.error.message);
    expect(inventoryActions.deleteMedicine(blank.value.medicine.id).ok).toBe(true);

    act(() => {
      inventoryActions.updateSettings({ pharmacyName: 'After Hooks', expiryAlertDays: 10 });
    });
    expect(result.current.settings.pharmacyName).toBe('After Hooks');

    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 31, 11));
    try {
      await act(async () => {
        await inventoryActions.resetDemoData();
      });
    } finally {
      vi.useRealTimers();
    }
    expect(result.current).toEqual(demoInventory(FIXED_TODAY));
  });
});
