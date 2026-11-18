import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { selectTransactionViews, useInventoryStore } from '@/data';
import { demoInventory } from '@/data/testing/demo';
import { formatDateTime } from '@/shared/format';
import { renderWithRouter } from '../../../../tests/render';
import { TransactionsPage } from './TransactionsPage';

const TODAY = new Date(2026, 9, 31);

function bodyRows() {
  const table = screen.getByRole('table', { name: 'Transactions' });
  return within(table).getAllByRole('row').slice(1);
}

describe('TransactionsPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 31, 10, 30));
    useInventoryStore.setState(demoInventory(TODAY), true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('lists the newest transactions first', () => {
    renderWithRouter(<TransactionsPage />, {
      path: '/transactions',
      initialEntry: '/transactions',
    });
    const views = selectTransactionViews(useInventoryStore.getState());
    const rows = bodyRows();
    expect(rows).toHaveLength(10);
    const dates = views.slice(0, 10).map((view) => formatDateTime(view.date));
    rows.forEach((row, index) => {
      expect(within(row).getAllByRole('cell')[0]).toHaveTextContent(dates[index] ?? '');
    });
    const times = views.map((view) => view.date);
    expect([...times].sort().reverse()).toEqual(times);
  });

  it('filters by type through the URL', async () => {
    const user = userEvent.setup();
    const { router } = renderWithRouter(<TransactionsPage />, {
      path: '/transactions',
      initialEntry: '/transactions',
    });
    const stockIn = useInventoryStore
      .getState()
      .transactions.filter((tx) => tx.type === 'STOCK_IN').length;

    await user.selectOptions(screen.getByRole('combobox', { name: 'Filter by type' }), 'STOCK_IN');

    expect(router.state.location.search).toContain('type=STOCK_IN');
    const rows = bodyRows();
    expect(rows).toHaveLength(Math.min(stockIn, 10));
    for (const row of rows) expect(row).toHaveTextContent('Stock In');
  });

  it('has no edit or delete controls', () => {
    renderWithRouter(<TransactionsPage />, {
      path: '/transactions',
      initialEntry: '/transactions',
    });
    expect(screen.queryByRole('button', { name: /edit|delete/i })).not.toBeInTheDocument();
  });
});
