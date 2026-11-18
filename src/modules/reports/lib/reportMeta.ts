import {
  AlarmClock,
  BookOpen,
  Boxes,
  History,
  PackageCheck,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import { REPORT_IDS, type ReportId } from '@/data';

export interface ReportFilterDef {
  key: string;
  label: string;
  allLabel: string;
}

export interface ReportMeta {
  description: string;
  itemLabel: string;
  filters: readonly ReportFilterDef[];
  searchPlaceholder: string;
  empty: { icon: LucideIcon; title: string; description: string };
}

export const REPORT_META: Record<ReportId, ReportMeta> = {
  catalogue: {
    description: 'Every medicine on file with its price, minimum level and current usable stock.',
    itemLabel: 'medicines',
    filters: [
      { key: 'category', label: 'Category', allLabel: 'All categories' },
      { key: 'status', label: 'Status', allLabel: 'All statuses' },
    ],
    searchPlaceholder: 'Search name, generic or maker',
    empty: {
      icon: BookOpen,
      title: 'No medicines yet',
      description: 'Add a medicine to start building the catalogue.',
    },
  },
  'usable-stock': {
    description:
      'Medicines with usable stock today, valued at unit price. Expired batches are excluded.',
    itemLabel: 'medicines',
    filters: [{ key: 'category', label: 'Category', allLabel: 'All categories' }],
    searchPlaceholder: 'Search medicines',
    empty: {
      icon: Boxes,
      title: 'No usable stock',
      description: 'Receive stock to see usable quantities and their value here.',
    },
  },
  'low-stock': {
    description: 'Active medicines whose usable stock is at or below their minimum level.',
    itemLabel: 'medicines',
    filters: [{ key: 'category', label: 'Category', allLabel: 'All categories' }],
    searchPlaceholder: 'Search medicines',
    empty: {
      icon: PackageCheck,
      title: 'Nothing is running low',
      description: 'Every active medicine is stocked above its minimum level.',
    },
  },
  'expiring-soon': {
    description: 'Batches in stock that expire today or within the alert threshold, soonest first.',
    itemLabel: 'batches',
    filters: [{ key: 'status', label: 'Status', allLabel: 'All statuses' }],
    searchPlaceholder: 'Search medicine or batch',
    empty: {
      icon: AlarmClock,
      title: 'Nothing is expiring soon',
      description: 'No batch in stock expires within the alert threshold.',
    },
  },
  expired: {
    description: 'Batches past their expiry date that still hold stock and should be disposed of.',
    itemLabel: 'batches',
    filters: [{ key: 'medicine', label: 'Medicine', allLabel: 'All medicines' }],
    searchPlaceholder: 'Search medicine or batch',
    empty: {
      icon: TriangleAlert,
      title: 'No expired stock',
      description: 'No batch in stock is past its expiry date.',
    },
  },
  transactions: {
    description: 'Every stock movement, newest first. Transactions are immutable.',
    itemLabel: 'transactions',
    filters: [
      { key: 'type', label: 'Type', allLabel: 'All types' },
      { key: 'reason', label: 'Reason', allLabel: 'All reasons' },
    ],
    searchPlaceholder: 'Search medicine, batch or remarks',
    empty: {
      icon: History,
      title: 'No transactions yet',
      description: 'Stock movements appear here as soon as stock is received or adjusted.',
    },
  },
};

export function isReportId(value: string | undefined): value is ReportId {
  return value !== undefined && (REPORT_IDS as readonly string[]).includes(value);
}
