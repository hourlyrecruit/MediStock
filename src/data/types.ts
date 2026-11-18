export type ID = string;
export type ISODate = string;
export type ISODateTime = string;

export type MedicineCategory = string;

export interface CategoryRef {
  name: MedicineCategory;
}

export interface ReferenceData {
  categories: CategoryRef[];
}

export interface CurrentUser {
  id: ID;
  name: string;
  role: string;
  email: string;
}

export interface Medicine {
  id: ID;
  name: string;
  genericName: string;
  category: MedicineCategory;
  manufacturer: string;
  unitPrice: number;
  minStockLevel: number;
  description: string;
  isActive: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Batch {
  id: ID;
  medicineId: ID;
  batchNumber: string;
  openingQuantity: number;
  quantity: number;
  expiryDate: ISODate;
  receivedDate: ISODate;
  createdAt: ISODateTime;
}

export const TRANSACTION_TYPES = [
  'STOCK_IN',
  'ADJUSTMENT_INCREASE',
  'ADJUSTMENT_DECREASE',
  'BATCH_CREATED',
] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const ADJUSTMENT_REASONS = [
  'DAMAGED',
  'EXPIRED_DISPOSED',
  'COUNT_CORRECTION',
  'RETURNED',
  'OTHER',
] as const;
export type AdjustmentReason = (typeof ADJUSTMENT_REASONS)[number];

export const EXPIRY_STATUSES = ['EXPIRED', 'EXPIRES_TODAY', 'EXPIRING_SOON', 'VALID'] as const;
export type ExpiryStatus = (typeof EXPIRY_STATUSES)[number];

export interface StockTransaction {
  id: ID;
  medicineId: ID;
  batchId: ID;
  type: TransactionType;
  quantityChange: number;
  quantityAfter: number;
  date: ISODateTime;
  reason?: AdjustmentReason;
  remarks?: string;
}

export interface Settings {
  pharmacyName: string;
  currency: 'INR';
  expiryAlertDays: number;
}

export interface InventoryState {
  schemaVersion: 2;
  medicines: Record<ID, Medicine>;
  batches: Record<ID, Batch>;
  transactions: StockTransaction[];
  settings: Settings;
  reference: ReferenceData;
  seededOn: ISODate;
}

export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export type ResolvedTheme = Exclude<ThemePreference, 'system'>;

export const MOTION_PREFERENCES = ['on', 'off'] as const;
export type MotionPreference = (typeof MOTION_PREFERENCES)[number];

export interface UiPrefs {
  sidebarCollapsed: boolean;
  hasSeenWelcome: boolean;
  theme: ThemePreference;
  motion: MotionPreference;
}

export type DomainErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'NEGATIVE_STOCK'
  | 'BATCH_EXPIRED'
  | 'DUPLICATE_BATCH'
  | 'DUPLICATE_MEDICINE'
  | 'MEDICINE_INACTIVE'
  | 'MEDICINE_HAS_HISTORY';

export interface DomainError {
  code: DomainErrorCode;
  message: string;
  field?: string;
}

export type Result<T, E = DomainError> = { ok: true; value: T } | { ok: false; error: E };

export interface BatchView extends Batch {
  medicine: Medicine;
  daysLeft: number;
  status: ExpiryStatus;
  isUsable: boolean;
}

export interface StockSummary {
  usable: number;
  expiringToday: number;
  expiringSoon: number;
  expired: number;
  total: number;
  batchCount: number;
  nextExpiry: ISODate | null;
}

export interface MedicineView extends Medicine {
  stock: StockSummary;
  isLowStock: boolean;
  shortfall: number;
}

export interface TransactionView extends StockTransaction {
  medicineName: string;
  batchNumber: string;
}

export interface Kpis {
  totalMedicines: number;
  activeMedicines: number;
  usableUnits: number;
  usableStockValue: number;
  lowStockCount: number;
  expiresTodayCount: number;
  expiringSoonCount: number;
  expiredCount: number;
  expiredUnits: number;
}

export interface CategorySlice {
  category: MedicineCategory;
  medicines: number;
  usableUnits: number;
}

export interface MonthlyAddition {
  month: string;
  label: string;
  units: number;
}

export type NotificationKind = 'LOW_STOCK' | 'EXPIRES_TODAY' | 'EXPIRING_SOON' | 'EXPIRED';

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  title: string;
  detail: string;
  href: string;
}

export interface BatchHistoryRow {
  id: string;
  kind: 'OPENING' | TransactionType;
  date: ISODateTime | null;
  quantityChange: number;
  quantityAfter: number;
  reason?: AdjustmentReason;
  remarks?: string;
}

export const REPORT_IDS = [
  'catalogue',
  'usable-stock',
  'low-stock',
  'expiring-soon',
  'expired',
  'transactions',
] as const;
export type ReportId = (typeof REPORT_IDS)[number];
