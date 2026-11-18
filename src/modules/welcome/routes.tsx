import type { RouteObject } from 'react-router';
import type { RouteHandle } from '@/shared/module';

export const routes: RouteObject[] = [
  {
    path: 'welcome',
    handle: { title: 'Welcome', crumb: 'Welcome' } satisfies RouteHandle,
    lazy: () => import('./pages/WelcomePage').then((m) => ({ Component: m.WelcomePage })),
  },
];
