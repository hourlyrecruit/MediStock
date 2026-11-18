import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { inventoryActions, selectKpis, useInventoryStore } from '@/data';
import { demoInventory } from '@/data/testing/demo';
import { useToastStore } from '@/design-system';
import { renderWithRouter } from '../../../tests/render';
import { SettingsPage } from './pages/SettingsPage';

const TODAY = new Date(2026, 9, 31);

function setup() {
  return renderWithRouter(<SettingsPage />, { path: '/settings', initialEntry: '/settings' });
}

function counts() {
  const state = useInventoryStore.getState();
  return {
    medicines: Object.keys(state.medicines).length,
    batches: Object.keys(state.batches).length,
    transactions: state.transactions.length,
  };
}

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(TODAY);
    useInventoryStore.setState(demoInventory(TODAY), true);
    useToastStore.setState({ toasts: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('validates the pharmacy name and saves a valid one', async () => {
    const user = userEvent.setup();
    setup();
    const input = screen.getByLabelText(/Display name/);
    expect(input).toHaveValue('GreenLeaf Pharmacy');

    await user.clear(input);
    await user.type(input, 'A');
    await user.click(screen.getByRole('button', { name: 'Save name' }));
    expect(
      await screen.findByText('Pharmacy name must be at least 2 characters'),
    ).toBeInTheDocument();
    expect(useInventoryStore.getState().settings.pharmacyName).toBe('GreenLeaf Pharmacy');

    await user.type(input, 'pex Care');
    await user.click(screen.getByRole('button', { name: 'Save name' }));
    await waitFor(() =>
      expect(useInventoryStore.getState().settings.pharmacyName).toBe('Apex Care'),
    );
    expect(useToastStore.getState().toasts[0]?.message).toBe('Pharmacy name saved');
    expect(useInventoryStore.getState().settings.expiryAlertDays).toBe(30);
  });

  it('rejects thresholds outside 1 to 365 days', async () => {
    const user = userEvent.setup();
    setup();
    const input = screen.getByLabelText(/Expiry alert threshold/);

    await user.clear(input);
    await user.type(input, '0');
    expect(await screen.findByText('Alert days must be at least 1')).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, '400');
    expect(await screen.findByText('Alert days cannot exceed 365')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save threshold' }));
    expect(useInventoryStore.getState().settings.expiryAlertDays).toBe(30);
  });

  it('previews and saves the threshold so KPI counts recompute', async () => {
    const user = userEvent.setup();
    setup();
    const before = selectKpis(useInventoryStore.getState(), TODAY).expiringSoonCount;
    const input = screen.getByLabelText(/Expiry alert threshold/);

    await user.clear(input);
    await user.type(input, '120');
    expect(await screen.findByText(/With/)).toHaveTextContent(
      /With 120 days, \d+ batch(es)? (is|are) expiring soon/,
    );

    await user.click(screen.getByRole('button', { name: 'Save threshold' }));
    await waitFor(() => expect(useInventoryStore.getState().settings.expiryAlertDays).toBe(120));
    const after = selectKpis(useInventoryStore.getState(), TODAY).expiringSoonCount;
    expect(after).toBeGreaterThan(before);
  });

  it('requires confirmation before restoring the seed data', async () => {
    const user = userEvent.setup();
    setup();
    const seed = counts();
    inventoryActions.updateSettings({ pharmacyName: 'Changed', expiryAlertDays: 90 });
    useInventoryStore.setState({ transactions: [] });
    expect(counts().transactions).toBe(0);

    await user.click(screen.getByRole('button', { name: 'Reset demo data' }));
    const dialog = await screen.findByRole('dialog', { name: 'Reset demo data?' });
    expect(counts().transactions).toBe(0);

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(counts().transactions).toBe(0);

    await user.click(screen.getByRole('button', { name: 'Reset demo data' }));
    const again = await screen.findByRole('dialog', { name: 'Reset demo data?' });
    await user.click(within(again).getByRole('button', { name: 'Reset demo data' }));

    await waitFor(() => expect(counts()).toEqual(seed));
    expect(useInventoryStore.getState().settings).toMatchObject({
      pharmacyName: 'GreenLeaf Pharmacy',
      expiryAlertDays: 30,
    });
    expect(screen.getByLabelText(/Display name/)).toHaveValue('GreenLeaf Pharmacy');
    expect(useToastStore.getState().toasts[0]?.message).toBe('Demo data restored');
  });
});
