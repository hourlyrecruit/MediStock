import { FileBarChart } from 'lucide-react';
import type { ModuleConfig } from '@/shared/module';
import { routes } from './routes';

export const reportsModule: ModuleConfig = {
  id: 'reports',
  label: 'Reports',
  icon: FileBarChart,
  path: '/reports',
  routes,
  navOrder: 7,
  layout: 'shell',
  mobileTab: false,
  breadcrumb: 'Reports',
};
