import { Pill } from 'lucide-react';
import type { ModuleConfig } from '@/shared/module';
import { routes } from './routes';

export const medicinesModule: ModuleConfig = {
  id: 'medicines',
  label: 'Medicines',
  icon: Pill,
  path: '/medicines',
  routes,
  navOrder: 2,
  layout: 'shell',
  mobileTab: true,
  breadcrumb: 'Medicines',
};
