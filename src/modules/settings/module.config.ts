import { Settings } from 'lucide-react';
import type { ModuleConfig } from '@/shared/module';
import { routes } from './routes';

export const settingsModule: ModuleConfig = {
  id: 'settings',
  label: 'Settings',
  icon: Settings,
  path: '/settings',
  routes,
  navOrder: 8,
  layout: 'shell',
  mobileTab: false,
  breadcrumb: 'Settings',
};
