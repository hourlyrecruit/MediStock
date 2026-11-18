import { resolveTheme } from './useTheme';
import { useUiStore } from '@/data/store/uiStore';

describe('resolveTheme', () => {
  it('follows the system when preference is system', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('honours an explicit preference regardless of the system', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});

describe('theme preference', () => {
  it('defaults to system and persists changes', () => {
    expect(useUiStore.getState().theme).toBe('system');
    useUiStore.getState().setTheme('dark');
    expect(useUiStore.getState().theme).toBe('dark');
    expect(localStorage.getItem('medistock:ui')).toContain('"theme":"dark"');
  });
});
