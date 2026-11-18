import { act, screen, within } from '@testing-library/react';
import {
  inventoryActions,
  selectBatchViews,
  selectLowStock,
  selectMedicineViews,
  useInventoryStore,
} from '@/data';
import { demoCategories, demoInventory } from '@/data/testing/demo';
import { FIXED_TODAY } from '@/data/testing/fixtures';
import { renderWithRouter } from '../../../../tests/render';
import { LowStockPage } from './LowStockPage';

function renderPage(search = 'size=200') {
  return renderWithRouter(<LowStockPage />, {
    path: '/low-stock',
    initialEntry: `/low-stock?${search}`,
  });
}

function namesShown() {
  const table = screen.getByRole('table');
  return within(table)
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('link')[0]?.textContent ?? '');
}

describe('LowStockPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 31));
    useInventoryStore.setState(demoInventory(FIXED_TODAY), true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('lists exactly the active low-stock medicines, largest shortfall first', () => {
    renderPage();
    const state = useInventoryStore.getState();
    const expected = selectMedicineViews(state, FIXED_TODAY)
      .filter((view) => view.isActive && view.stock.usable < view.minStockLevel)
      .toSorted((a, b) => b.shortfall - a.shortfall);
    expect(expected.length).toBeGreaterThan(0);
    const shown = namesShown();
    expect(shown.toSorted()).toEqual(expected.map((view) => view.name).toSorted());
    const shortfalls = shown.map(
      (name) => expected.find((view) => view.name === name)?.shortfall ?? -1,
    );
    expect(shortfalls).toEqual(shortfalls.toSorted((a, b) => b - a));
    expect(screen.getByRole('columnheader', { name: /shortfall/i })).toHaveAttribute(
      'aria-sort',
      'descending',
    );
  });

  it('excludes inactive medicines', () => {
    const state = useInventoryStore.getState();
    const inactiveLow = selectMedicineViews(state, FIXED_TODAY).filter(
      (view) => !view.isActive && view.stock.usable < view.minStockLevel,
    );
    renderPage();
    for (const view of inactiveLow) expect(namesShown()).not.toContain(view.name);

    const target = selectLowStock(state, FIXED_TODAY)[0];
    if (!target) throw new Error('seed has no low-stock medicine');
    expect(namesShown()).toContain(target.name);
    act(() => {
      inventoryActions.setMedicineActive(target.id, false);
    });
    expect(namesShown()).not.toContain(target.name);
  });

  it('drops a medicine once a receive lifts it above minimum', () => {
    const state = useInventoryStore.getState();
    const views = selectBatchViews(state, FIXED_TODAY);
    const target = selectLowStock(state, FIXED_TODAY).find((med) =>
      views.some((batch) => batch.medicineId === med.id && batch.isUsable),
    );
    const batch = views.find((view) => view.medicineId === target?.id && view.isUsable);
    if (!target || !batch) throw new Error('seed has no receivable low-stock medicine');

    renderPage();
    expect(namesShown()).toContain(target.name);
    act(() => {
      const result = inventoryActions.receiveStock({
        batchId: batch.id,
        quantity: target.shortfall,
        date: '2026-10-31',
      });
      expect(result.ok).toBe(true);
    });
    expect(screen.queryByRole('link', { name: target.name })).not.toBeInTheDocument();
  });

  it('filters by category from the URL and shows an empty state', () => {
    const lowCategories = new Set(
      selectLowStock(useInventoryStore.getState(), FIXED_TODAY).map((v) => v.category),
    );
    const quiet = demoCategories().find((category) => !lowCategories.has(category));
    if (!quiet) return;
    renderPage(`category=${encodeURIComponent(quiet)}`);
    expect(screen.getByText(`Nothing low in ${quiet}`)).toBeInTheDocument();
  });
});
