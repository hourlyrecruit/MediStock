import { CalendarClock } from 'lucide-react';
import type { ModuleConfig } from '@/shared/module';
import { routes } from './routes';

export const expiryModule: ModuleConfig = {
  id: 'expiry',
  label: 'Expiry Management',
  icon: CalendarClock,
  path: '/expiry',
  routes,
  navOrder: 4,
  layout: 'shell',
  mobileTab: true,
  breadcrumb: 'Expiry Management',
};
