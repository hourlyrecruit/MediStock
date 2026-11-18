import { apiConfig } from './config';
import { ApiError } from './errors';
import { loadAppData } from './loader';

export type SyncErrorListener = (error: ApiError) => void;

const listeners = new Set<SyncErrorListener>();

export function onSyncError(listener: SyncErrorListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function toApiError(error: unknown) {
  if (error instanceof ApiError) return error;
  return new ApiError(0, error instanceof Error ? error.message : 'Sync failed');
}

export function syncMutation<T>(send: () => Promise<T>, reconcile?: (value: T) => void) {
  if (apiConfig.mode === 'mock') return;
  send()
    .then((value) => reconcile?.(value))
    .catch((error: unknown) => {
      const apiError = toApiError(error);
      listeners.forEach((listener) => listener(apiError));
      void loadAppData({ force: true }).catch(() => undefined);
    });
}
