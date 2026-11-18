import type { RouteObject } from 'react-router';
import type { RouteHandle } from '@/shared/module';

export const routes: RouteObject[] = [
  {
    path: 'transactions',
    handle: { title: 'Transactions', crumb: 'Transactions' } satisfies RouteHandle,
    lazy: () => import('./pages/TransactionsPage').then((m) => ({ Component: m.TransactionsPage })),
  },
];
