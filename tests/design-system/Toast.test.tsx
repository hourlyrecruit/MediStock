import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MAX_VISIBLE_TOASTS, Toaster, toast, useToastStore } from '@/design-system';
import { renderWithMotion } from '../render';

afterEach(() => {
  act(() => useToastStore.setState({ toasts: [] }));
});

describe('Toast', () => {
  it('shows a polite status toast with its description', async () => {
    renderWithMotion(<Toaster />);
    act(() => {
      toast.success('Batch saved', { description: 'B-1042 added to stock.' });
    });
    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent('Batch saved');
    expect(status).toHaveTextContent('B-1042 added to stock.');
  });

  it('announces errors assertively', async () => {
    renderWithMotion(<Toaster />);
    act(() => {
      toast.error('Could not save');
    });
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not save');
  });

  it('runs the action and dismisses the toast', async () => {
    const user = userEvent.setup();
    const onUndo = vi.fn();
    renderWithMotion(<Toaster />);
    act(() => {
      toast.info('Medicine archived', { action: { label: 'Undo', onClick: onUndo } });
    });
    await user.click(await screen.findByRole('button', { name: 'Undo' }));
    expect(onUndo).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByText('Medicine archived')).not.toBeInTheDocument());
  });

  it('auto-dismisses after its duration', async () => {
    renderWithMotion(<Toaster />);
    act(() => {
      toast.success('Quick note', { duration: 50 });
    });
    expect(await screen.findByText('Quick note')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Quick note')).not.toBeInTheDocument());
  });

  it(`limits the stack to ${MAX_VISIBLE_TOASTS} visible toasts`, async () => {
    renderWithMotion(<Toaster />);
    act(() => {
      for (let i = 1; i <= 6; i += 1) toast.info(`Note ${i}`);
    });
    await waitFor(() => expect(screen.getAllByRole('status')).toHaveLength(MAX_VISIBLE_TOASTS));
    expect(screen.getByText('Note 6')).toBeInTheDocument();
    expect(screen.queryByText('Note 1')).not.toBeInTheDocument();
  });
});
