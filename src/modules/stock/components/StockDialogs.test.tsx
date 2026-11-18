import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { selectBatchViews, useInventoryStore, type BatchView } from '@/data';
import { demoInventory } from '@/data/testing/demo';
import { useToastStore } from '@/design-system';
import { formatNumber } from '@/shared/format';
import { renderWithMotion } from '../../../../tests/render';
import { AdjustStockDialog, ReceiveStockDialog } from './StockDialogs';

const TODAY = new Date(2026, 9, 31);

function findBatch(predicate: (view: BatchView) => boolean) {
  const view = selectBatchViews(useInventoryStore.getState(), TODAY).find(predicate);
  if (!view) throw new Error('No matching batch in seed');
  return view;
}

const usableBatch = () => findBatch((view) => view.status === 'VALID' && view.quantity > 5);
const expiredBatch = () => findBatch((view) => view.status === 'EXPIRED' && view.quantity > 0);

describe('stock dialogs', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 31, 10, 30));
    useInventoryStore.setState(demoInventory(TODAY), true);
    useToastStore.setState({ toasts: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('blocks an adjustment that would make stock negative', async () => {
    const user = userEvent.setup();
    const batch = usableBatch();
    const before = useInventoryStore.getState().transactions.length;
    renderWithMotion(
      <AdjustStockDialog
        open
        onOpenChange={vi.fn()}
        batchId={batch.id}
        defaultDirection="DECREASE"
      />,
    );

    await user.type(screen.getByLabelText(/Quantity/), String(batch.quantity + 1));

    expect(screen.getByText(new RegExp(`available in ${batch.batchNumber}`))).toBeInTheDocument();
    const submit = screen.getByRole('button', { name: 'Save adjustment' });
    expect(submit).toBeDisabled();
    await user.click(submit);
    expect(useInventoryStore.getState().transactions).toHaveLength(before);
  });

  it('requires remarks only when the reason is Other', async () => {
    const user = userEvent.setup();
    const batch = usableBatch();
    const before = useInventoryStore.getState().transactions.length;
    renderWithMotion(<AdjustStockDialog open onOpenChange={vi.fn()} batchId={batch.id} />);

    expect(screen.queryByText(/Required — explain/)).not.toBeInTheDocument();
    expect(screen.getByText('(optional)')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Quantity/), '1');
    await user.selectOptions(screen.getByLabelText(/Reason/), 'OTHER');
    expect(screen.getByText(/Required — explain/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save adjustment' }));
    expect(
      await screen.findByText('Remarks are required when the reason is Other'),
    ).toBeInTheDocument();
    expect(useInventoryStore.getState().transactions).toHaveLength(before);
  });

  it('disables increase for an expired batch', () => {
    const batch = expiredBatch();
    renderWithMotion(
      <AdjustStockDialog
        open
        onOpenChange={vi.fn()}
        batchId={batch.id}
        defaultDirection="INCREASE"
      />,
    );

    const direction = screen.getByRole('tablist', { name: 'Direction' });
    expect(within(direction).getByRole('tab', { name: /Increase/ })).toBeDisabled();
    expect(within(direction).getByRole('tab', { name: /Decrease/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText(/can only be decreased/)).toBeInTheDocument();
  });

  it('blocks receiving into an expired batch', () => {
    const batch = expiredBatch();
    renderWithMotion(<ReceiveStockDialog open onOpenChange={vi.fn()} batchId={batch.id} />);

    expect(screen.getByRole('alert')).toHaveTextContent(`Batch ${batch.batchNumber} expired`);
    expect(screen.getByRole('button', { name: 'Receive stock' })).toBeDisabled();
  });

  it('receives stock with exactly one STOCK_IN transaction', async () => {
    const user = userEvent.setup();
    const batch = usableBatch();
    const before = useInventoryStore.getState().transactions.length;
    const onDone = vi.fn();
    const onOpenChange = vi.fn();
    renderWithMotion(
      <ReceiveStockDialog open onOpenChange={onOpenChange} batchId={batch.id} onDone={onDone} />,
    );

    await user.type(screen.getByLabelText(/Quantity/), '50');
    expect(screen.getByTestId('quantity-preview')).toHaveTextContent(
      formatNumber(batch.quantity + 50),
    );
    await user.click(screen.getByRole('button', { name: 'Receive stock' }));

    const state = useInventoryStore.getState();
    expect(state.transactions).toHaveLength(before + 1);
    const transaction = state.transactions.at(-1);
    expect(transaction).toMatchObject({ type: 'STOCK_IN', batchId: batch.id, quantityChange: 50 });
    expect(state.batches[batch.id]?.quantity).toBe(batch.quantity + 50);
    expect(onDone).toHaveBeenCalledWith(batch.id);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(useToastStore.getState().toasts[0]?.message).toBe(
      `Received 50 units into ${batch.batchNumber}`,
    );
  });
});
