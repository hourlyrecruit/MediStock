import type { RouteObject } from 'react-router';
import type { RouteHandle } from '@/shared/module';

export const routes: RouteObject[] = [
  {
    path: 'settings',
    handle: { title: 'Settings', crumb: 'Settings' } satisfies RouteHandle,
    lazy: () => import('./pages/SettingsPage').then((m) => ({ Component: m.SettingsPage })),
  },
];
