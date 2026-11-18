import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DataTable, type ColumnDef } from '@/design-system';
import { renderWithRouter } from '../render';

interface Item {
  id: string;
  name: string;
  qty: number;
}

const items: Item[] = Array.from({ length: 25 }, (_, i) => ({
  id: `m${i + 1}`,
  name: `Medicine ${String.fromCharCode(65 + (i % 26))}${i + 1}`,
  qty: (i * 7) % 40,
}));

const columns: ColumnDef<Item>[] = [
  { id: 'name', header: 'Name', cell: (r) => r.name, sortValue: (r) => r.name, searchValue: (r) => r.name },
  { id: 'qty', header: 'Quantity', cell: (r) => r.qty, sortValue: (r) => r.qty, align: 'right' },
];

function setup(initialEntry = '/list') {
  return renderWithRouter(
    <DataTable rows={items} columns={columns} getRowId={(r) => r.id} caption="Medicines" />,
    { path: '/list', initialEntry },
  );
}

const bodyRows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1);

describe('DataTable', () => {
  it('renders the first page with a caption and range summary', () => {
    setup();
    expect(screen.getByRole('table', { name: 'Medicines' })).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(10);
    expect(screen.getByText(/Showing/)).toHaveTextContent('Showing 1–10 of 25 results');
  });

  it('sorts on header click and writes sort state to the URL', async () => {
    const user = userEvent.setup();
    const { router } = setup();
    const header = screen.getByRole('columnheader', { name: /Quantity/ });
    expect(header).toHaveAttribute('aria-sort', 'none');

    await user.click(within(header).getByRole('button'));
    expect(router.state.location.search).toContain('sort=qty');
    expect(screen.getByRole('columnheader', { name: /Quantity/ })).toHaveAttribute('aria-sort', 'ascending');
    expect(within(bodyRows()[0]!).getAllByRole('cell')[1]).toHaveTextContent('0');

    await user.click(within(screen.getByRole('columnheader', { name: /Quantity/ })).getByRole('button'));
    expect(router.state.location.search).toContain('dir=desc');
    expect(screen.getByRole('columnheader', { name: /Quantity/ })).toHaveAttribute('aria-sort', 'descending');
    expect(within(bodyRows()[0]!).getAllByRole('cell')[1]).toHaveTextContent('39');
  });

  it('paginates and reflects the page in the URL', async () => {
    const user = userEvent.setup();
    const { router } = setup();
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(router.state.location.search).toContain('page=2');
    expect(screen.getByText(/Showing/)).toHaveTextContent('Showing 11–20 of 25 results');
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
  });

  it('reads initial state from the URL and clamps out-of-range pages', () => {
    setup('/list?page=9&size=20');
    expect(bodyRows()).toHaveLength(5);
    expect(screen.getByText(/Showing/)).toHaveTextContent('Showing 21–25 of 25 results');
  });

  it('debounces search into the URL and shows an empty state', async () => {
    const user = userEvent.setup();
    const { router } = setup('/list?page=2');
    await user.type(screen.getByRole('searchbox', { name: 'Search medicines' }), 'zzz');
    await waitFor(() => expect(router.state.location.search).toContain('q=zzz'));
    expect(router.state.location.search).not.toContain('page=');
    const empty = (await screen.findByText('No matches')).parentElement!;
    await user.click(within(empty).getByRole('button', { name: 'Clear search' }));
    await waitFor(() => expect(router.state.location.search).not.toContain('q='));
  });
});
