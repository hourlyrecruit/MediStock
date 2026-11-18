import type { AdjustmentReason, ID } from '@/data';

export interface AddBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicineId?: ID;
  onDone?: (batchId: ID) => void;
}

export interface ReceiveStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId?: ID;
  medicineId?: ID;
  onDone?: (batchId: ID) => void;
}

export interface AdjustStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId?: ID;
  medicineId?: ID;
  defaultDirection?: 'INCREASE' | 'DECREASE';
  defaultReason?: AdjustmentReason;
  onDone?: (batchId: ID) => void;
}
