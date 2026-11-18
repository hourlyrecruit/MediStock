import type { z } from 'zod';
import type { DomainError, DomainErrorCode, Result } from '@/data/types';

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err<T = never>(code: DomainErrorCode, message: string, field?: string): Result<T> {
  const error: DomainError = field ? { code, message, field } : { code, message };
  return { ok: false, error };
}

export function validationError<T = never>(error: z.ZodError): Result<T> {
  const issue = error.issues[0];
  const field = issue?.path.map(String).join('.');
  return err('VALIDATION', issue?.message ?? 'Invalid input', field || undefined);
}

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}
