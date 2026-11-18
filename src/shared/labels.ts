import type { AdjustmentReason, ExpiryStatus, ReportId, TransactionType } from '@/data/types';

export const EXPIRY_STATUS_LABEL: Record<ExpiryStatus, string> = {
  EXPIRED: 'Expired',
  EXPIRES_TODAY: 'Expires Today',
  EXPIRING_SOON: 'Expiring Soon',
  VALID: 'Valid',
};

export const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  STOCK_IN: 'Stock In',
  ADJUSTMENT_INCREASE: 'Adjustment +',
  ADJUSTMENT_DECREASE: 'Adjustment −',
  BATCH_CREATED: 'Batch Created',
};

export const ADJUSTMENT_REASON_LABEL: Record<AdjustmentReason, string> = {
  DAMAGED: 'Damaged',
  EXPIRED_DISPOSED: 'Expired – disposed',
  COUNT_CORRECTION: 'Count correction',
  RETURNED: 'Returned to stock',
  OTHER: 'Other',
};

export const REPORT_LABEL: Record<ReportId, string> = {
  catalogue: 'Medicine catalogue',
  'usable-stock': 'Usable stock',
  'low-stock': 'Low stock',
  'expiring-soon': 'Expiring soon',
  expired: 'Expired batches',
  transactions: 'Transaction history',
};
