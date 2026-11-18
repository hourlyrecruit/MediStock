import { ArrowLeftRight } from 'lucide-react';
import type { ModuleConfig } from '@/shared/module';
import { routes } from './routes';

export const transactionsModule: ModuleConfig = {
  id: 'transactions',
  label: 'Transactions',
  icon: ArrowLeftRight,
  path: '/transactions',
  routes,
  navOrder: 6,
  layout: 'shell',
  mobileTab: false,
  breadcrumb: 'Transactions',
};
