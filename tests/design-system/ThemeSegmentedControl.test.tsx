import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { ThemeSegmentedControl } from '@/design-system';
import { useUiStore } from '@/data/store/uiStore';
import { renderWithMotion } from '../render';

afterEach(() => {
  act(() => useUiStore.getState().setTheme('system'));
});

describe('ThemeSegmentedControl', () => {
  it('reflects and updates the theme preference', async () => {
    const user = userEvent.setup();
    renderWithMotion(<ThemeSegmentedControl />);
    expect(screen.getByRole('tablist', { name: 'Theme' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Auto' })).toHaveAttribute('aria-selected', 'true');

    await user.click(screen.getByRole('tab', { name: 'Dark' }));
    expect(useUiStore.getState().theme).toBe('dark');
    expect(screen.getByRole('tab', { name: 'Dark' })).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowLeft}');
    expect(useUiStore.getState().theme).toBe('light');
    expect(screen.getByRole('tab', { name: 'Light' })).toHaveFocus();
  });
});
