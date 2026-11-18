import { act, screen, within } from '@testing-library/react';
import {
  inventoryActions,
  selectExpiringSoon,
  selectKpis,
  selectLowStock,
  useInventoryStore,
} from '@/data';
import { demoInventory } from '@/data/testing/demo';
import { formatNumber } from '@/shared/format';
import { links } from '@/shared/routes';
import { renderWithRouter } from '../../../../tests/render';
import { DashboardPage } from './DashboardPage';

const TODAY = new Date(2026, 9, 31);

function kpiLink(label: string) {
  const heading = screen.getByText(label, { selector: 'p' });
  const link = heading.closest('a');
  if (!link) throw new Error(`No link for ${label}`);
  return link;
}

function kpiValue(label: string) {
  return within(kpiLink(label)).getByText(/^[\d,]+$/, { selector: '.sr-only' }).textContent;
}

function renderDashboard() {
  return renderWithRouter(<DashboardPage />);
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 31, 10, 30));
    useInventoryStore.setState(demoInventory(TODAY), true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('greets by time of day with the pharmacy name', () => {
    renderDashboard();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Good Morning, GreenLeaf Pharmacy');
  });

  it('shows KPI values that match selectKpis for the seed', () => {
    const kpis = selectKpis(useInventoryStore.getState(), TODAY);
    renderDashboard();
    expect(kpiValue('Total medicines')).toBe(formatNumber(kpis.activeMedicines));
    expect(kpiValue('Usable units')).toBe(formatNumber(kpis.usableUnits));
    expect(kpiValue('Low stock')).toBe(formatNumber(kpis.lowStockCount));
    expect(kpiValue('Expiring soon')).toBe(
      formatNumber(kpis.expiringSoonCount + kpis.expiresTodayCount),
    );
    expect(kpiValue('Expired batches')).toBe(formatNumber(kpis.expiredCount));
    expect(kpiLink('Total medicines')).toHaveTextContent(`of ${kpis.totalMedicines} total`);
    expect(kpiLink('Expiring soon')).toHaveTextContent(`incl. ${kpis.expiresTodayCount} today`);
    expect(kpiLink('Expired batches')).toHaveTextContent(
      `${formatNumber(kpis.expiredUnits)} units`,
    );
  });

  it('deep-links each KPI with filters pre-applied', () => {
    renderDashboard();
    expect(kpiLink('Total medicines')).toHaveAttribute('href', '/medicines?status=active');
    expect(kpiLink('Usable units')).toHaveAttribute('href', '/stock');
    expect(kpiLink('Low stock')).toHaveAttribute('href', '/low-stock');
    expect(kpiLink('Expiring soon')).toHaveAttribute('href', '/expiry?status=expiring-soon');
    expect(kpiLink('Expired batches')).toHaveAttribute('href', '/expiry?status=expired');
  });

  it('lists the top five low-stock medicines', () => {
    const expected = selectLowStock(useInventoryStore.getState(), TODAY).slice(0, 5);
    renderDashboard();
    const table = screen.getByRole('table', { name: 'Low stock' });
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(expected.length);
    expected.forEach((medicine, index) => {
      const row = rows[index]!;
      expect(within(row).getByRole('link', { name: medicine.name })).toHaveAttribute(
        'href',
        links.medicine(medicine.id),
      );
      expect(row).toHaveTextContent(`−${formatNumber(medicine.shortfall)}`);
    });
    expect(screen.getByRole('link', { name: 'View all low-stock medicines' })).toHaveAttribute(
      'href',
      '/low-stock',
    );
  });

  it('lists the five soonest expiries including today', () => {
    const expected = selectExpiringSoon(useInventoryStore.getState(), TODAY, {
      includeToday: true,
    }).slice(0, 5);
    renderDashboard();
    const table = screen.getByRole('table', { name: 'Upcoming expiries' });
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(expected.length);
    expect(expected[0]?.status).toBe('EXPIRES_TODAY');
    expected.forEach((batch, index) => {
      const row = rows[index]!;
      expect(row).toHaveTextContent(batch.medicine.name);
      expect(row).toHaveTextContent(batch.batchNumber);
      expect(row).toHaveTextContent(formatNumber(batch.quantity));
    });
    expect(within(rows[0]!).getAllByText('Expires today').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'View all expiring batches' })).toHaveAttribute(
      'href',
      '/expiry?status=expiring-soon',
    );
  });

  it('updates KPIs live when stock changes', () => {
    renderDashboard();
    const before = selectKpis(useInventoryStore.getState(), TODAY);
    const batch = Object.values(useInventoryStore.getState().batches).find(
      (candidate) => candidate.quantity >= 5 && candidate.expiryDate > '2027-01-01',
    );
    if (!batch) throw new Error('No suitable batch in seed');
    act(() => {
      const result = inventoryActions.adjustStock({
        batchId: batch.id,
        direction: 'DECREASE',
        quantity: 5,
        reason: 'DAMAGED',
        remarks: 'Broken strip',
      });
      expect(result.ok).toBe(true);
    });
    expect(kpiValue('Usable units')).toBe(formatNumber(before.usableUnits - 5));
  });

  it('shows empty states when nothing needs attention', () => {
    const state = demoInventory(TODAY);
    const medicines = Object.fromEntries(
      Object.entries(state.medicines).map(([id, medicine]) => [
        id,
        { ...medicine, minStockLevel: 0 },
      ]),
    );
    useInventoryStore.setState({ ...state, medicines, batches: {}, transactions: [] }, true);
    renderDashboard();
    expect(screen.getByText('Everything is stocked')).toBeInTheDocument();
    expect(screen.getByText('Nothing expiring soon')).toBeInTheDocument();
  });

  it('summarises monthly additions in an accessible table', () => {
    renderDashboard();
    const table = screen.getByRole('table', { name: 'Monthly stock additions' });
    expect(within(table).getAllByRole('row')).toHaveLength(7);
  });
});
