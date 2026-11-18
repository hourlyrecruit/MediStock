import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { selectReportRows, useInventoryStore } from '@/data';
import { demoInventory } from '@/data/testing/demo';
import { useToastStore } from '@/design-system';
import { downloadCsv, toCsv } from '@/shared/csv';
import type * as CsvModule from '@/shared/csv';
import { renderWithRouter } from '../../../tests/render';
import { ReportPage } from './pages/ReportPage';

vi.mock('@/shared/csv', async (importOriginal) => {
  const actual = await importOriginal<typeof CsvModule>();
  return { ...actual, downloadCsv: vi.fn() };
});

const TODAY = new Date(2026, 9, 31);

function setup(initialEntry: string) {
  return renderWithRouter(<ReportPage />, { path: '/reports/:reportId', initialEntry });
}

describe('ReportPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(TODAY);
    useInventoryStore.setState(demoInventory(TODAY), true);
    useToastStore.setState({ toasts: [] });
    vi.mocked(downloadCsv).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('exports exactly the searched rows across all pages', async () => {
    const user = userEvent.setup();
    setup('/reports/transactions?q=stock');
    const report = selectReportRows(useInventoryStore.getState(), TODAY, 'transactions');
    const expected = report.rows.filter((row) =>
      Object.values(row).some(
        (value) => typeof value === 'string' && value.toLowerCase().includes('stock'),
      ),
    );
    expect(expected.length).toBeGreaterThan(10);
    expect(expected.length).toBeLessThan(report.rows.length);

    await user.click(screen.getByRole('button', { name: 'Export CSV' }));

    expect(downloadCsv).toHaveBeenCalledTimes(1);
    expect(downloadCsv).toHaveBeenCalledWith(
      'medistock-transactions-2026-10-31.csv',
      toCsv(report.columns, expected),
    );
    expect(useToastStore.getState().toasts[0]?.message).toBe(`Exported ${expected.length} rows`);
  });

  it('applies URL filters and sort to the export', async () => {
    const user = userEvent.setup();
    setup('/reports/catalogue?category=Analgesics&sort=unitPrice&dir=desc');
    const report = selectReportRows(useInventoryStore.getState(), TODAY, 'catalogue');
    const expected = report.rows
      .filter((row) => row.category === 'Analgesics')
      .sort((a, b) => Number(b.unitPrice) - Number(a.unitPrice));
    expect(expected.length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Export CSV' }));

    expect(downloadCsv).toHaveBeenCalledWith(
      'medistock-catalogue-2026-10-31.csv',
      toCsv(report.columns, expected),
    );
  });

  it('disables export when nothing matches', () => {
    setup('/reports/catalogue?q=zzzzzz');
    expect(screen.getByText('No matches')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeDisabled();
    expect(screen.getByText('0 rows')).toBeInTheDocument();
  });

  it('shows the report empty state when a report has no rows', () => {
    const state = useInventoryStore.getState();
    useInventoryStore.setState({ ...state, transactions: [] });
    setup('/reports/transactions');
    expect(screen.getByText('No transactions yet')).toBeInTheDocument();
  });

  it('shows a friendly not-found state for an unknown report', () => {
    setup('/reports/unknown-report');
    expect(screen.getByRole('heading', { name: 'Report not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to medicine catalogue/ })).toHaveAttribute(
      'href',
      '/reports/catalogue',
    );
    expect(screen.queryByRole('button', { name: 'Export CSV' })).not.toBeInTheDocument();
    expect(
      screen.getAllByRole('tab').filter((tab) => tab.getAttribute('aria-selected') === 'true'),
    ).toHaveLength(0);
  });

  it('navigates between reports with the segmented control', async () => {
    const user = userEvent.setup();
    const { router } = setup('/reports/catalogue');
    const tabs = screen.getByRole('tablist', { name: 'Reports' });
    await user.click(within(tabs).getByRole('tab', { name: 'Expired batches' }));
    expect(router.state.location.pathname).toBe('/reports/expired');
  });
});
