import { ApiError } from '../errors';
import type { Transport } from '../client';
import { offsetDays, rebasePayload } from './rebase';

type JsonModule = Promise<{ default: unknown }>;

const fixtures: Record<string, () => JsonModule> = {
  '/me': () => import('./me.json'),
  '/reference-data': () => import('./reference-data.json'),
  '/settings': () => import('./settings.json'),
  '/medicines': () => import('./medicines.json'),
  '/batches': () => import('./batches.json'),
  '/transactions': () => import('./transactions.json'),
};

async function referenceDate() {
  const { default: meta } = await import('./meta.json');
  return meta.referenceDate;
}

export const mockTransport: Transport = async ({ method, path }) => {
  if (method !== 'GET') return { data: null };
  const load = fixtures[path];
  if (!load) throw new ApiError(404, `No mock fixture for ${path}`, 'NOT_FOUND');
  const [{ default: payload }, anchor] = await Promise.all([load(), referenceDate()]);
  return rebasePayload(path, payload, offsetDays(anchor, new Date()));
};
