import type { ComponentType, ReactNode } from 'react';
import type { Params, RouteObject } from 'react-router';
import type { LucideIcon } from 'lucide-react';

export type ModuleId =
  | 'welcome'
  | 'dashboard'
  | 'medicines'
  | 'stock'
  | 'expiry'
  | 'low-stock'
  | 'transactions'
  | 'reports'
  | 'settings';

export type FeatureFlag = never;

export interface RouteHandle {
  title?: string;
  crumb?: string | ComponentType<{ params: Params }>;
}

export interface ModuleConfig {
  id: ModuleId;
  label: string;
  icon: LucideIcon;
  path: string;
  routes: RouteObject[];
  navOrder: number | null;
  layout: 'shell' | 'bare';
  mobileTab?: boolean;
  featureFlag?: FeatureFlag;
  breadcrumb: string;
  description?: ReactNode;
}
