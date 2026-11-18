import { redirect, type RouteObject } from 'react-router';
import type { RouteHandle } from '@/shared/module';
import { links } from '@/shared/routes';
import { ReportCrumb } from './components/ReportCrumb';

export const routes: RouteObject[] = [
  {
    path: 'reports',
    handle: { title: 'Reports', crumb: 'Reports' } satisfies RouteHandle,
    children: [
      { index: true, loader: () => redirect(links.report('catalogue')) },
      {
        path: ':reportId',
        handle: { title: 'Reports', crumb: ReportCrumb } satisfies RouteHandle,
        lazy: () => import('./pages/ReportPage').then((m) => ({ Component: m.ReportPage })),
      },
    ],
  },
];
