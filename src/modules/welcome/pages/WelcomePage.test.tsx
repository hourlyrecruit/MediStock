import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { selectKpis, useInventoryStore, useUiStore } from '@/data';
import { demoInventory } from '@/data/testing/demo';
import { formatNumber } from '@/shared/format';
import { WelcomePage } from './WelcomePage';
import { renderWithRouter } from '../../../../tests/render';

const TODAY = new Date(2026, 9, 31);

function renderWelcome() {
  return renderWithRouter(<WelcomePage />, { path: '/welcome', initialEntry: '/welcome' });
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TODAY);
  useInventoryStore.setState(demoInventory(TODAY), true);
  useUiStore.setState({ hasSeenWelcome: false });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('WelcomePage', () => {
  it('shows the pharmacy name and live KPI chips', () => {
    renderWelcome();
    const state = useInventoryStore.getState();
    const kpis = selectKpis(state, TODAY);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Every batch, accounted for.' }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(state.settings.pharmacyName, { exact: false }).length,
    ).toBeGreaterThan(0);

    const chips = screen.getByRole('list', { name: 'Inventory at a glance' });
    expect(chips).toHaveTextContent(`${formatNumber(kpis.usableUnits)}usable units`);
    expect(chips).toHaveTextContent(`${formatNumber(kpis.lowStockCount)}low stock`);
    expect(chips).toHaveTextContent(
      `${formatNumber(kpis.expiringSoonCount + kpis.expiresTodayCount)}expiring soon`,
    );
    expect(chips).toHaveTextContent(`${formatNumber(kpis.expiredCount)}expired`);
  });

  it('marks the welcome as seen and enters the dashboard', async () => {
    const user = userEvent.setup();
    const { router } = renderWelcome();

    await user.click(screen.getByRole('button', { name: 'Enter dashboard' }));

    expect(useUiStore.getState().hasSeenWelcome).toBe(true);
    expect(router.state.location.pathname).toBe('/dashboard');
  });

  it('marks the welcome as seen from the expiry alerts link', async () => {
    const user = userEvent.setup();
    const { router } = renderWelcome();

    await user.click(screen.getByRole('link', { name: 'View expiry alerts' }));

    expect(useUiStore.getState().hasSeenWelcome).toBe(true);
    expect(router.state.location.pathname).toBe('/expiry');
    expect(router.state.location.search).toBe('?status=expiring-soon');
  });

  it('keeps the 3D illustration described for assistive technology', () => {
    renderWelcome();
    expect(
      screen.getByText('Illustration of floating capsules, a medicine bottle and a medical cross'),
    ).toBeInTheDocument();
  });
});
