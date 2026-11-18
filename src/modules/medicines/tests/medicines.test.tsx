import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LazyMotion, MotionConfig, domMax } from 'framer-motion';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toaster, useToastStore } from '@/design-system';
import { inventoryActions, useInventoryStore, type Medicine } from '@/data';
import { demoInventory } from '@/data/testing/demo';
import { routes } from '../routes';

const TODAY = new Date(2026, 9, 31);

function Root() {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="always">
        <Outlet />
        <Toaster />
      </MotionConfig>
    </LazyMotion>
  );
}

function setup(initialEntry: string) {
  const router = createMemoryRouter([{ element: <Root />, children: routes }], {
    initialEntries: [initialEntry],
  });
  render(<RouterProvider router={router} />);
  return { router, user: userEvent.setup() };
}

function medicines() {
  return Object.values(useInventoryStore.getState().medicines);
}

function medicineWithHistory(): Medicine {
  const state = useInventoryStore.getState();
  const id = state.transactions[0]?.medicineId ?? Object.values(state.batches)[0]?.medicineId;
  const medicine = id ? state.medicines[id] : undefined;
  if (!medicine || !medicine.isActive) {
    const active = medicines().find(
      (m) => m.isActive && Object.values(state.batches).some((b) => b.medicineId === m.id),
    );
    if (!active) throw new Error('Seed has no active medicine with batches');
    return active;
  }
  return medicine;
}

function createFreshMedicine(): Medicine {
  const result = inventoryActions.createMedicine({
    name: 'Testocil 10',
    genericName: 'Testamol',
    category: 'Analgesics',
    manufacturer: 'Spec Labs',
    unitPrice: 12.5,
    minStockLevel: 10,
    description: '',
    isActive: true,
  });
  if (!result.ok) throw new Error(result.error.message);
  return result.value.medicine;
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TODAY);
  useInventoryStore.setState(demoInventory(TODAY), true);
});

afterEach(() => {
  act(() => useToastStore.setState({ toasts: [] }));
  vi.useRealTimers();
});

async function bodyRows() {
  const table = await screen.findByRole('table', { name: 'Medicines' });
  return within(table).getAllByRole('row').slice(1);
}

describe('Medicines list', () => {
  it('reads the status filter from the URL', async () => {
    setup('/medicines?status=inactive&size=50');
    const rows = await bodyRows();
    const inactive = medicines().filter((m) => !m.isActive);
    expect(rows).toHaveLength(inactive.length);
    for (const row of rows) expect(row).toHaveTextContent('Inactive');
    expect(screen.getByRole('tab', { name: 'Inactive' })).toHaveAttribute('aria-selected', 'true');
  });

  it('reads the category filter from the URL', async () => {
    setup('/medicines?category=Antibiotics&size=50');
    const rows = await bodyRows();
    const expected = medicines().filter((m) => m.category === 'Antibiotics');
    expect(rows).toHaveLength(expected.length);
    expect(screen.getByRole('combobox', { name: 'Category' })).toHaveValue('Antibiotics');
  });

  it('writes filters back to the URL', async () => {
    const { router, user } = setup('/medicines');
    await bodyRows();
    await user.click(screen.getByRole('tab', { name: 'Active' }));
    expect(router.state.location.search).toContain('status=active');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Category' }), 'Cardiovascular');
    expect(router.state.location.search).toContain('category=Cardiovascular');
  });
});

describe('Medicine form', () => {
  it('shows validation messages', async () => {
    const { user } = setup('/medicines/new');
    const dialog = await screen.findByRole('dialog', { name: 'Add medicine' });
    await user.click(within(dialog).getByRole('button', { name: 'Add medicine' }));
    expect(
      await within(dialog).findByText('Name must be at least 2 characters'),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText('Generic name must be at least 2 characters'),
    ).toBeInTheDocument();
    expect(within(dialog).getByText('Select a category', { selector: 'p' })).toBeInTheDocument();
    expect(within(dialog).getByText('Unit price must be a number')).toBeInTheDocument();
    expect(within(dialog).getByRole('textbox', { name: /Brand name/ })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  async function fillForm(
    user: ReturnType<typeof userEvent.setup>,
    name: string,
    genericName: string,
  ) {
    const dialog = await screen.findByRole('dialog', { name: 'Add medicine' });
    await user.type(within(dialog).getByRole('textbox', { name: /Brand name/ }), name);
    await user.type(within(dialog).getByRole('textbox', { name: /Generic name/ }), genericName);
    await user.selectOptions(
      within(dialog).getByRole('combobox', { name: /Category/ }),
      'Antibiotics',
    );
    await user.type(
      within(dialog).getByRole('textbox', { name: /Manufacturer/ }),
      'Northstar Labs',
    );
    await user.type(within(dialog).getByRole('spinbutton', { name: /Unit price/ }), '24.5');
    await user.type(within(dialog).getByRole('spinbutton', { name: /Minimum stock/ }), '30');
    await user.click(within(dialog).getByRole('button', { name: 'Add medicine' }));
    return dialog;
  }

  it('creates a medicine and navigates to it', async () => {
    const { router, user } = setup('/medicines/new');
    const before = medicines().length;
    await fillForm(user, 'Zentrocin 250', 'Zentromycin');
    await waitFor(() => expect(medicines()).toHaveLength(before + 1));
    const created = medicines().find((m) => m.name === 'Zentrocin 250');
    expect(created).toMatchObject({
      genericName: 'Zentromycin',
      unitPrice: 24.5,
      minStockLevel: 30,
    });
    await waitFor(() => expect(router.state.location.pathname).toBe(`/medicines/${created?.id}`));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Zentrocin 250' }, { timeout: 5000 }),
    ).toBeInTheDocument();
  });

  it('shows a duplicate error on the name field', async () => {
    const { router, user } = setup('/medicines/new');
    const existing = medicines()[0];
    if (!existing) throw new Error('Seed is empty');
    const before = medicines().length;
    const dialog = await fillForm(user, existing.name, existing.genericName);
    expect(await within(dialog).findByText(/already exists/)).toBeInTheDocument();
    expect(medicines()).toHaveLength(before);
    expect(router.state.location.pathname).toBe('/medicines/new');
  });
});

describe('Medicine detail', () => {
  it('shows a friendly not-found state for an unknown id', async () => {
    setup('/medicines/does-not-exist');
    expect(await screen.findByText('Medicine not found')).toBeInTheDocument();
  });

  it('deactivates with an undo action that restores the medicine', async () => {
    const medicine = medicineWithHistory();
    const { user } = setup(`/medicines/${medicine.id}`);
    await user.click(await screen.findByRole('button', { name: 'Deactivate' }));
    expect(useInventoryStore.getState().medicines[medicine.id]?.isActive).toBe(false);
    expect(await screen.findByRole('button', { name: 'Activate' })).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Undo' }));
    expect(useInventoryStore.getState().medicines[medicine.id]?.isActive).toBe(true);
    expect(await screen.findByRole('button', { name: 'Deactivate' })).toBeInTheDocument();
  });

  it('disables delete for a medicine with stock history', async () => {
    const medicine = medicineWithHistory();
    const { user } = setup(`/medicines/${medicine.id}`);
    const button = await screen.findByRole('button', { name: 'Delete' });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    await user.click(button);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useInventoryStore.getState().medicines[medicine.id]).toBeDefined();
  });

  it('deletes a fresh medicine after confirmation', async () => {
    const medicine = createFreshMedicine();
    const { router, user } = setup(`/medicines/${medicine.id}`);
    const button = await screen.findByRole('button', { name: 'Delete' });
    expect(button).not.toHaveAttribute('aria-disabled');
    await user.click(button);
    const dialog = await screen.findByRole('dialog', { name: /Delete Testocil 10/ });
    await user.click(within(dialog).getByRole('button', { name: 'Delete medicine' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/medicines'));
    expect(useInventoryStore.getState().medicines[medicine.id]).toBeUndefined();
  });

  it('syncs the tab with the URL', async () => {
    const medicine = medicineWithHistory();
    const { router, user } = setup(`/medicines/${medicine.id}?tab=transactions`);
    expect(await screen.findByRole('tab', { name: /Transactions/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await user.click(screen.getByRole('tab', { name: /Batches/ }));
    expect(router.state.location.search).not.toContain('tab=');
    expect(
      await screen.findByRole('table', { name: `Batches of ${medicine.name}` }),
    ).toBeInTheDocument();
  });

  it('opens the edit sheet over the detail page', async () => {
    const medicine = medicineWithHistory();
    const { router, user } = setup(`/medicines/${medicine.id}/edit`);
    const dialog = await screen.findByRole('dialog', { name: 'Edit medicine' });
    const name = within(dialog).getByRole('textbox', { name: /Brand name/ });
    expect(name).toHaveValue(medicine.name);
    await user.clear(name);
    await user.type(name, `${medicine.name} XR`);
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(router.state.location.pathname).toBe(`/medicines/${medicine.id}`));
    expect(useInventoryStore.getState().medicines[medicine.id]?.name).toBe(`${medicine.name} XR`);
  });
});
