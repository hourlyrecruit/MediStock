import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button, Dialog } from '@/design-system';
import { renderWithMotion } from '../render';

function setup(onOpenChange = vi.fn()) {
  renderWithMotion(
    <Dialog
      trigger={<Button>Open dialog</Button>}
      title="Edit medicine"
      description="Update the catalogue entry."
      onOpenChange={onOpenChange}
      footer={<Button>Save</Button>}
    >
      <label htmlFor="dlg-name">Name</label>
      <input id="dlg-name" />
    </Dialog>,
  );
  return onOpenChange;
}

describe('Dialog', () => {
  it('labels the dialog and moves focus inside when opened', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: 'Open dialog' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit medicine' });
    expect(dialog).toHaveAccessibleDescription('Update the catalogue entry.');
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('traps focus while tabbing', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: 'Open dialog' }));
    const dialog = await screen.findByRole('dialog');
    for (let i = 0; i < 6; i += 1) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
    await user.tab({ shift: true });
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    const onOpenChange = setup();
    const trigger = screen.getByRole('button', { name: 'Open dialog' });
    await user.click(trigger);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
