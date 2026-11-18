import type { RouteObject } from 'react-router';
import type { RouteHandle } from '@/shared/module';

export const routes: RouteObject[] = [
  {
    path: 'expiry',
    handle: { title: 'Expiry Management', crumb: 'Expiry Management' } satisfies RouteHandle,
    lazy: () => import('./pages/ExpiryPage').then((m) => ({ Component: m.ExpiryPage })),
  },
];
