import type { DomainErrorCode } from '@/data/types';

export class ApiError extends Error {
  readonly status: number;
  readonly code: DomainErrorCode | 'NETWORK' | 'INVALID_RESPONSE' | 'HTTP';
  readonly field: string | undefined;

  constructor(status: number, message: string, code: ApiError['code'] = 'HTTP', field?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.field = field;
  }
}

export function invalidResponse(path: string) {
  return new ApiError(
    502,
    `The server sent an unexpected response for ${path}`,
    'INVALID_RESPONSE',
  );
}
