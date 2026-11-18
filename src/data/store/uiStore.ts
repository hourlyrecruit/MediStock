import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MotionPreference, ThemePreference, UiPrefs } from '@/data/types';

interface UiStore extends UiPrefs {
  commandOpen: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  markWelcomeSeen: () => void;
  setCommandOpen: (open: boolean) => void;
  setTheme: (theme: ThemePreference) => void;
  setMotion: (motion: MotionPreference) => void;
}

export const UI_STORAGE_KEY = 'medistock:ui';

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      hasSeenWelcome: false,
      theme: 'system',
      motion: 'on',
      commandOpen: false,
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      markWelcomeSeen: () => set({ hasSeenWelcome: true }),
      setCommandOpen: (commandOpen) => set({ commandOpen }),
      setTheme: (theme) => set({ theme }),
      setMotion: (motion) => set({ motion }),
    }),
    {
      name: UI_STORAGE_KEY,
      version: 3,
      migrate: (persisted, version) => {
        const prefs = (persisted ?? {}) as Partial<UiPrefs>;
        const theme = version < 2 ? 'system' : (prefs.theme ?? 'system');
        return { ...prefs, theme, motion: prefs.motion ?? 'on' } as UiPrefs;
      },
      partialize: ({ sidebarCollapsed, hasSeenWelcome, theme, motion }) => ({
        sidebarCollapsed,
        hasSeenWelcome,
        theme,
        motion,
      }),
    },
  ),
);
