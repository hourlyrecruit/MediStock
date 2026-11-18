import type {
  AddBatchInput,
  AdjustStockInput,
  MedicineInput,
  ReceiveStockInput,
  SettingsInput,
} from '@/data/services/schemas';
import type { Batch, ID, StockTransaction } from '@/data/types';

export type CreateMedicineRequest = MedicineInput & { id: ID };
export type UpdateMedicineRequest = MedicineInput;
export interface SetMedicineActiveRequest {
  isActive: boolean;
}

export type CreateBatchRequest = AddBatchInput & { id: ID; transactionId: ID };
export type ReceiveStockRequest = Omit<ReceiveStockInput, 'batchId'> & { transactionId: ID };
export type AdjustStockRequest = Omit<AdjustStockInput, 'batchId'> & { transactionId: ID };

export interface StockChangeResponse {
  batch: Batch;
  transaction: StockTransaction;
}

export type UpdateSettingsRequest = SettingsInput;
