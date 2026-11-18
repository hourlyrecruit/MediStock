import { apiConfig } from './config';
import { ApiError, invalidResponse } from './errors';
import { mockTransport } from './mock/server';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequest {
  method: HttpMethod;
  path: string;
  body?: unknown;
}

export type Transport = (request: ApiRequest) => Promise<unknown>;

interface ErrorBody {
  error?: { code?: ApiError['code']; message?: string; field?: string };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export const httpTransport: Transport = async ({ method, path, body }) => {
  let response: Response;
  try {
    response = await fetch(`${apiConfig.baseUrl}${path}`, {
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection.', 'NETWORK');
  }
  if (response.status === 204) return { data: null };
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = isObject(payload) ? (payload as ErrorBody).error : undefined;
    throw new ApiError(
      response.status,
      error?.message ?? (response.statusText || 'Request failed'),
      error?.code ?? 'HTTP',
      error?.field,
    );
  }
  return payload;
};

let transport: Transport = apiConfig.mode === 'http' ? httpTransport : mockTransport;

export function setTransport(next: Transport) {
  const previous = transport;
  transport = next;
  return () => {
    transport = previous;
  };
}

export async function apiRequest(request: ApiRequest): Promise<unknown> {
  const payload = await transport(request);
  if (!isObject(payload) || !('data' in payload)) throw invalidResponse(request.path);
  return payload.data;
}
