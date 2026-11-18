import type { RouteObject } from 'react-router';
import type { RouteHandle } from '@/shared/module';

export const routes: RouteObject[] = [
  {
    path: 'low-stock',
    handle: { title: 'Low Stock', crumb: 'Low Stock' } satisfies RouteHandle,
    lazy: () => import('./pages/LowStockPage').then((m) => ({ Component: m.LowStockPage })),
  },
];
