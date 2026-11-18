import { LayoutDashboard } from 'lucide-react';
import type { ModuleConfig } from '@/shared/module';
import { routes } from './routes';

export const dashboardModule: ModuleConfig = {
  id: 'dashboard',
  label: 'Dashboard',
  icon: LayoutDashboard,
  path: '/dashboard',
  routes,
  navOrder: 1,
  layout: 'shell',
  mobileTab: true,
  breadcrumb: 'Dashboard',
};
