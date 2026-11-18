import type { ModuleConfig } from '@/shared/module';
import { welcomeModule } from '@/modules/welcome/module.config';
import { dashboardModule } from '@/modules/dashboard/module.config';
import { medicinesModule } from '@/modules/medicines/module.config';
import { stockModule } from '@/modules/stock/module.config';
import { expiryModule } from '@/modules/expiry/module.config';
import { lowStockModule } from '@/modules/low-stock/module.config';
import { transactionsModule } from '@/modules/transactions/module.config';
import { reportsModule } from '@/modules/reports/module.config';
import { settingsModule } from '@/modules/settings/module.config';

export const registry: ModuleConfig[] = [
  welcomeModule,
  dashboardModule,
  medicinesModule,
  stockModule,
  expiryModule,
  lowStockModule,
  transactionsModule,
  reportsModule,
  settingsModule,
];

export const navItems = registry
  .filter((m) => m.navOrder !== null && m.layout === 'shell')
  .sort((a, b) => (a.navOrder ?? 0) - (b.navOrder ?? 0));

export const mobileTabs = navItems.filter((m) => m.mobileTab);
export const mobileMoreItems = navItems.filter((m) => !m.mobileTab);
