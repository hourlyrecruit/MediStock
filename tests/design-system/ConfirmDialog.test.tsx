import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from '@/design-system';
import { renderWithMotion } from '../render';

function deferred() {
  let resolve: () => void = () => undefined;
  let reject: (error: Error) => void = () => undefined;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function setup(onConfirm: () => unknown) {
  const onOpenChange = vi.fn();
  renderWithMotion(
    <ConfirmDialog
      open
      onOpenChange={onOpenChange}
      title="Delete medicine?"
      description="This cannot be undone."
      confirmLabel="Delete"
      tone="danger"
      onConfirm={onConfirm}
    />,
  );
  return onOpenChange;
}

describe('ConfirmDialog', () => {
  it('shows a loading state while the async confirm runs, then closes', async () => {
    const user = userEvent.setup();
    const pending = deferred();
    const onOpenChange = setup(() => pending.promise);
    const confirm = screen.getByRole('button', { name: 'Delete' });
    await user.click(confirm);

    expect(confirm).toHaveAttribute('aria-busy', 'true');
    expect(confirm).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await user.keyboard('{Escape}');
    expect(onOpenChange).not.toHaveBeenCalled();

    await act(async () => pending.resolve());
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('stays open and re-enables when the confirm fails', async () => {
    const user = userEvent.setup();
    const pending = deferred();
    const onOpenChange = setup(() => pending.promise);
    const confirm = screen.getByRole('button', { name: 'Delete' });
    await user.click(confirm);
    await act(async () => pending.reject(new Error('nope')));
    await waitFor(() => expect(confirm).not.toBeDisabled());
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('cancels without confirming', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onOpenChange = setup(onConfirm);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
