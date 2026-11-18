import type { ExpiryStatus, ID, ReportId, TransactionType } from '@/data/types';

export type ExpiryFilter = 'all' | 'expires-today' | 'expiring-soon' | 'expired' | 'valid';

export const STATUS_PARAM: Record<ExpiryStatus, Exclude<ExpiryFilter, 'all'>> = {
  EXPIRED: 'expired',
  EXPIRES_TODAY: 'expires-today',
  EXPIRING_SOON: 'expiring-soon',
  VALID: 'valid',
};

type Params = Record<string, string | number | undefined>;

function withQuery(path: string, params?: Params) {
  if (!params) return path;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export const links = {
  welcome: () => '/welcome',
  dashboard: () => '/dashboard',
  medicines: (params?: { q?: string; category?: string; status?: 'active' | 'inactive' | 'all' }) =>
    withQuery('/medicines', params),
  newMedicine: () => '/medicines/new',
  medicine: (id: ID, params?: { tab?: 'batches' | 'transactions' }) =>
    withQuery(`/medicines/${id}`, params),
  editMedicine: (id: ID) => `/medicines/${id}/edit`,
  stock: (params?: { q?: string; medicine?: ID; status?: Exclude<ExpiryFilter, 'all'> }) =>
    withQuery('/stock', params),
  expiry: (params?: { status?: ExpiryFilter; q?: string }) => withQuery('/expiry', params),
  lowStock: (params?: { q?: string; category?: string }) => withQuery('/low-stock', params),
  transactions: (params?: { q?: string; type?: TransactionType }) =>
    withQuery('/transactions', params),
  report: (id: ReportId) => `/reports/${id}`,
  settings: () => '/settings',
};
