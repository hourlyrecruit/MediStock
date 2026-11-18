export type ApiMode = 'mock' | 'http';

const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, '');

export const apiConfig: { baseUrl: string; mode: ApiMode } = {
  baseUrl,
  mode: baseUrl ? 'http' : 'mock',
};

export function isDemoMode() {
  return apiConfig.mode === 'mock';
}
