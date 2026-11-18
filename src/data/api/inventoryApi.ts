import type {
  Batch,
  CurrentUser,
  ID,
  Medicine,
  ReferenceData,
  Settings,
  StockTransaction,
} from '@/data/types';
import {
  isArrayOf,
  isBatch,
  isCurrentUser,
  isMedicine,
  isReferenceData,
  isSettings,
  isTransaction,
  type Guard,
} from '@/data/store/schema';
import { apiRequest, type ApiRequest } from './client';
import type {
  AdjustStockRequest,
  CreateBatchRequest,
  CreateMedicineRequest,
  ReceiveStockRequest,
  SetMedicineActiveRequest,
  StockChangeResponse,
  UpdateMedicineRequest,
  UpdateSettingsRequest,
} from './contracts';
import { endpoints } from './endpoints';
import { invalidResponse } from './errors';

const isStockChange: Guard<StockChangeResponse> = (value): value is StockChangeResponse =>
  typeof value === 'object' &&
  value !== null &&
  isBatch((value as Record<string, unknown>).batch) &&
  isTransaction((value as Record<string, unknown>).transaction);

async function request<T>(req: ApiRequest, guard: Guard<T>): Promise<T> {
  const data = await apiRequest(req);
  if (!guard(data)) throw invalidResponse(req.path);
  return data;
}

async function send(req: ApiRequest): Promise<void> {
  await apiRequest(req);
}

export const inventoryApi = {
  getCurrentUser: () => request<CurrentUser>({ method: 'GET', path: endpoints.me }, isCurrentUser),
  getReferenceData: () =>
    request<ReferenceData>({ method: 'GET', path: endpoints.referenceData }, isReferenceData),
  getSettings: () => request<Settings>({ method: 'GET', path: endpoints.settings }, isSettings),
  listMedicines: () =>
    request<Medicine[]>({ method: 'GET', path: endpoints.medicines }, isArrayOf(isMedicine)),
  listBatches: () =>
    request<Batch[]>({ method: 'GET', path: endpoints.batches }, isArrayOf(isBatch)),
  listTransactions: () =>
    request<StockTransaction[]>(
      { method: 'GET', path: endpoints.transactions },
      isArrayOf(isTransaction),
    ),

  createMedicine: (body: CreateMedicineRequest) =>
    request<Medicine>({ method: 'POST', path: endpoints.medicines, body }, isMedicine),
  updateMedicine: (id: ID, body: UpdateMedicineRequest) =>
    request<Medicine>({ method: 'PUT', path: endpoints.medicine(id), body }, isMedicine),
  setMedicineActive: (id: ID, body: SetMedicineActiveRequest) =>
    request<Medicine>({ method: 'PATCH', path: endpoints.medicine(id), body }, isMedicine),
  deleteMedicine: (id: ID) => send({ method: 'DELETE', path: endpoints.medicine(id) }),

  createBatch: (body: CreateBatchRequest) =>
    request<StockChangeResponse>({ method: 'POST', path: endpoints.batches, body }, isStockChange),
  receiveStock: (batchId: ID, body: ReceiveStockRequest) =>
    request<StockChangeResponse>(
      { method: 'POST', path: endpoints.batchReceipts(batchId), body },
      isStockChange,
    ),
  adjustStock: (batchId: ID, body: AdjustStockRequest) =>
    request<StockChangeResponse>(
      { method: 'POST', path: endpoints.batchAdjustments(batchId), body },
      isStockChange,
    ),

  updateSettings: (body: UpdateSettingsRequest) =>
    request<Settings>({ method: 'PATCH', path: endpoints.settings, body }, isSettings),
  resetDemoData: () => send({ method: 'POST', path: endpoints.demoReset }),
};

export type InventoryApi = typeof inventoryApi;
