import type { RouteObject } from 'react-router';
import type { RouteHandle } from '@/shared/module';

export const routes: RouteObject[] = [
  {
    path: 'dashboard',
    handle: { title: 'Dashboard', crumb: 'Dashboard' } satisfies RouteHandle,
    lazy: () => import('./pages/DashboardPage').then((m) => ({ Component: m.DashboardPage })),
  },
];
