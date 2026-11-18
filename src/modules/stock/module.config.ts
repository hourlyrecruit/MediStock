import { Boxes } from 'lucide-react';
import type { ModuleConfig } from '@/shared/module';
import { routes } from './routes';

export const stockModule: ModuleConfig = {
  id: 'stock',
  label: 'Stock Management',
  icon: Boxes,
  path: '/stock',
  routes,
  navOrder: 3,
  layout: 'shell',
  mobileTab: true,
  breadcrumb: 'Stock Management',
};
