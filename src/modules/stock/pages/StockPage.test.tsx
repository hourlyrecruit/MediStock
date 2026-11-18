import { screen, within } from '@testing-library/react';
import { selectBatchViews, useInventoryStore } from '@/data';
import { demoInventory } from '@/data/testing/demo';
import { renderWithRouter } from '../../../../tests/render';
import { StockPage } from './StockPage';

const TODAY = new Date(2026, 9, 31);

function bodyRows() {
  const table = screen.getByRole('table', { name: 'Batches' });
  return within(table).getAllByRole('row').slice(1);
}

describe('StockPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 31, 10, 30));
    useInventoryStore.setState(demoInventory(TODAY), true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('lists non-empty batches by expiry ascending', () => {
    renderWithRouter(<StockPage />, { path: '/stock', initialEntry: '/stock?size=100' });
    const expected = selectBatchViews(useInventoryStore.getState(), TODAY).filter(
      (view) => view.quantity > 0,
    );
    const rows = bodyRows();
    expect(rows).toHaveLength(expected.length);
    rows.forEach((row, index) => {
      expect(within(row).getAllByRole('cell')[0]).toHaveTextContent(
        expected[index]?.batchNumber ?? '',
      );
    });
  });

  it('filters by status from the URL', () => {
    renderWithRouter(<StockPage />, {
      path: '/stock',
      initialEntry: '/stock?status=expired&size=100',
    });
    const rows = bodyRows();
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) expect(row).toHaveTextContent(/Expired/);
  });
});
