import type { RouteObject } from 'react-router';
import type { RouteHandle } from '@/shared/module';
import { MedicineCrumb } from './components/MedicineCrumb';

function RouteMarker() {
  return null;
}

export const routes: RouteObject[] = [
  {
    path: 'medicines',
    handle: { title: 'Medicines', crumb: 'Medicines' } satisfies RouteHandle,
    children: [
      {
        lazy: () => import('./pages/MedicinesPage').then((m) => ({ Component: m.MedicinesPage })),
        children: [
          { index: true, Component: RouteMarker },
          {
            path: 'new',
            handle: { title: 'New medicine', crumb: 'New medicine' } satisfies RouteHandle,
            Component: RouteMarker,
          },
        ],
      },
      {
        path: ':id',
        handle: { title: 'Medicine details', crumb: MedicineCrumb } satisfies RouteHandle,
        lazy: () =>
          import('./pages/MedicineDetailPage').then((m) => ({ Component: m.MedicineDetailPage })),
        children: [
          { index: true, Component: RouteMarker },
          {
            path: 'edit',
            handle: { title: 'Edit medicine', crumb: 'Edit' } satisfies RouteHandle,
            Component: RouteMarker,
          },
        ],
      },
    ],
  },
];
