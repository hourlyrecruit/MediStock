import { Sparkles } from 'lucide-react';
import type { ModuleConfig } from '@/shared/module';
import { routes } from './routes';

export const welcomeModule: ModuleConfig = {
  id: 'welcome',
  label: 'Welcome',
  icon: Sparkles,
  path: '/welcome',
  routes,
  navOrder: null,
  layout: 'bare',
  mobileTab: false,
  breadcrumb: 'Welcome',
};
