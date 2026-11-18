import type { ReactNode } from 'react';
import type { TableColumn, TableState } from '@/shared/table';

export interface ColumnDef<T> extends TableColumn<T> {
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
  hideOnMobile?: boolean;
  hideBelowXl?: boolean;
  width?: string;
}

export interface DataTableBaseProps<T> {
  rows: readonly T[];
  columns: readonly ColumnDef<T>[];
  getRowId: (row: T) => string;
  caption: string;
  filters?: ReactNode;
  actions?: ReactNode;
  mobileCard?: (row: T) => ReactNode;
  emptyState?: ReactNode;
  flashIds?: ReadonlySet<string>;
  onRowClick?: (row: T) => void;
  rowHref?: (row: T) => string;
  loading?: boolean;
  searchPlaceholder?: string;
  pageSizeOptions?: readonly number[];
  itemLabel?: string;
  className?: string;
}

export interface DataTableProps<T> extends DataTableBaseProps<T> {
  state?: TableState;
  onStateChange?: (patch: Partial<TableState>) => void;
  defaultState?: Partial<TableState>;
}

export interface DataTableViewProps<T> extends DataTableBaseProps<T> {
  state: TableState;
  onStateChange: (patch: Partial<TableState>) => void;
}
