import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  inventoryActions,
  selectBatchViews,
  selectExpired,
  selectExpiresToday,
  selectExpiringSoon,
  useInventoryStore,
} from '@/data';
import { demoInventory } from '@/data/testing/demo';
import { FIXED_TODAY } from '@/data/testing/fixtures';
import { renderWithRouter } from '../../../../tests/render';
import { ExpiryPage } from './ExpiryPage';

function renderPage(search = '') {
  const params = new URLSearchParams(search);
  params.set('size', '200');
  return renderWithRouter(<ExpiryPage />, {
    path: '/expiry',
    initialEntry: `/expiry?${params.toString()}`,
  });
}

function batchNumbersShown() {
  const table = screen.getByRole('table');
  return within(table)
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[1]?.textContent ?? '');
}

function summaryCount(label: string) {
  const button = screen.getByRole('button', { name: new RegExp(`^${label}: \\d+ batch`) });
  return Number(/(\d+) batch/.exec(button.getAttribute('aria-label') ?? '')?.[1]);
}

describe('ExpiryPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 31));
    useInventoryStore.setState(demoInventory(FIXED_TODAY), true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('lists in-stock batches sorted by expiry ascending by default', () => {
    renderPage();
    const state = useInventoryStore.getState();
    const expected = selectBatchViews(state, FIXED_TODAY)
      .filter((view) => view.quantity > 0)
      .toSorted((a, b) => a.expiryDate.localeCompare(b.expiryDate));
    const shown = batchNumbersShown();
    expect(shown).toEqual(expected.map((view) => view.batchNumber));
    expect(screen.getByRole('columnheader', { name: /expiry date/i })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    expect(screen.getByRole('tab', { name: /^All/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('filters by status chips, keeping expires-today separate', async () => {
    const user = userEvent.setup();
    renderPage();
    const state = useInventoryStore.getState();
    const today = selectExpiresToday(state, FIXED_TODAY);
    const soon = selectExpiringSoon(state, FIXED_TODAY);
    expect(today.length).toBeGreaterThan(0);

    await user.click(screen.getByRole('tab', { name: /^Expires Today/ }));
    expect(batchNumbersShown().toSorted()).toEqual(today.map((v) => v.batchNumber).toSorted());

    await user.click(screen.getByRole('tab', { name: /^Expiring Soon/ }));
    const withToday = [...soon, ...today].map((v) => v.batchNumber).toSorted();
    expect(batchNumbersShown().toSorted()).toEqual(withToday);

    await user.click(screen.getByRole('switch', { name: /include expiring today/i }));
    expect(batchNumbersShown().toSorted()).toEqual(soon.map((v) => v.batchNumber).toSorted());
    for (const view of today) expect(batchNumbersShown()).not.toContain(view.batchNumber);
  });

  it('preselects the expired chip from the URL', () => {
    renderPage('status=expired');
    const expired = selectExpired(useInventoryStore.getState(), FIXED_TODAY);
    expect(screen.getByRole('tab', { name: /^Expired/ })).toHaveAttribute('aria-selected', 'true');
    expect(batchNumbersShown().toSorted()).toEqual(expired.map((v) => v.batchNumber).toSorted());
    expect(screen.getAllByRole('button', { name: /^Write off batch/ })).toHaveLength(
      expired.length,
    );
  });

  it('prefilters the search from q', () => {
    const target = selectExpired(useInventoryStore.getState(), FIXED_TODAY)[0];
    if (!target) throw new Error('seed has no expired batch');
    renderPage(`status=expired&q=${target.batchNumber}`);
    expect(screen.getByRole('searchbox', { name: /search/i })).toHaveValue(target.batchNumber);
    expect(batchNumbersShown()).toEqual([target.batchNumber]);
  });

  it('recomputes counts when the alert threshold changes', () => {
    renderPage();
    const before = selectExpiringSoon(useInventoryStore.getState(), FIXED_TODAY).length;
    expect(summaryCount('Expiring soon')).toBe(before);
    expect(screen.getByText(/Alert window/)).toHaveTextContent('Alert window: 30 days');

    act(() => {
      inventoryActions.updateSettings({ pharmacyName: 'Test Pharmacy', expiryAlertDays: 180 });
    });

    const state = useInventoryStore.getState();
    const after = selectExpiringSoon(state, FIXED_TODAY).length;
    expect(after).toBeGreaterThan(before);
    expect(summaryCount('Expiring soon')).toBe(after);
    expect(summaryCount('Valid')).toBe(
      selectBatchViews(state, FIXED_TODAY).filter((v) => v.quantity > 0 && v.status === 'VALID')
        .length,
    );
    expect(screen.getByText(/Alert window/)).toHaveTextContent('Alert window: 180 days');
  });
});
