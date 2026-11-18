import { useEffect } from 'react';
import { useUiStore } from '@/data/store/uiStore';
import type { ResolvedTheme, ThemePreference } from '@/data/types';
import { useMediaQuery } from './useMediaQuery';

const DARK_QUERY = '(prefers-color-scheme: dark)';

export function resolveTheme(preference: ThemePreference, systemDark: boolean): ResolvedTheme {
  if (preference === 'system') return systemDark ? 'dark' : 'light';
  return preference;
}

export function useTheme() {
  const preference = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const systemDark = useMediaQuery(DARK_QUERY);
  return { preference, resolved: resolveTheme(preference, systemDark), setTheme };
}

export function useApplyTheme() {
  const { resolved } = useTheme();
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolved;
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', resolved === 'dark' ? '#111111' : '#fafaf8');
  }, [resolved]);
}
