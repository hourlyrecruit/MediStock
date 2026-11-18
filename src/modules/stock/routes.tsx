import type { RouteObject } from 'react-router';
import type { RouteHandle } from '@/shared/module';

export const routes: RouteObject[] = [
  {
    path: 'stock',
    handle: { title: 'Stock Management', crumb: 'Stock Management' } satisfies RouteHandle,
    lazy: () => import('./pages/StockPage').then((m) => ({ Component: m.StockPage })),
  },
];
