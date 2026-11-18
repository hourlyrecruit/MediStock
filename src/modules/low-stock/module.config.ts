import { TrendingDown } from 'lucide-react';
import type { ModuleConfig } from '@/shared/module';
import { routes } from './routes';

export const lowStockModule: ModuleConfig = {
  id: 'low-stock',
  label: 'Low Stock',
  icon: TrendingDown,
  path: '/low-stock',
  routes,
  navOrder: 5,
  layout: 'shell',
  mobileTab: false,
  breadcrumb: 'Low Stock',
};
