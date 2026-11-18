import type { ReactNode } from 'react';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ArrowRight, CircleAlert, Info } from 'lucide-react';
import type { BatchView, DomainError } from '@/data';
import { Button, DialogClose } from '@/design-system';
import { cn } from '@/shared/cn';
import { formatDate, formatNumber } from '@/shared/format';

export function applyDomainError<T extends FieldValues>(
  error: DomainError,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
) {
  const field = fields.find((name) => name === error.field);
  if (field) setError(field, { type: error.code, message: error.message }, { shouldFocus: true });
  else setError('root.server', { type: error.code, message: error.message });
}

export function batchOptionLabel(view: BatchView) {
  const expired = view.status === 'EXPIRED' ? ' · expired' : '';
  return `${view.batchNumber} · exp ${formatDate(view.expiryDate)} · ${formatNumber(view.quantity)} units${expired}`;
}

interface NoticeProps {
  tone: 'danger' | 'info';
  children: ReactNode;
  className?: string;
}

export function Notice({ tone, children, className }: NoticeProps) {
  const Icon = tone === 'danger' ? CircleAlert : Info;
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2 rounded-sm border px-3 py-2.5 text-sm',
        tone === 'danger'
          ? 'border-danger/30 bg-danger-soft text-danger'
          : 'border-border-subtle bg-bg-subtle text-fg-muted',
        className,
      )}
    >
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

interface QuantityPreviewProps {
  current: number;
  next: number | null;
  invalid?: boolean;
}

export function QuantityPreview({ current, next, invalid = false }: QuantityPreviewProps) {
  return (
    <div
      aria-live="polite"
      data-testid="quantity-preview"
      className="border-border-subtle bg-bg-subtle flex items-center justify-between gap-4 rounded-sm border px-4 py-3"
    >
      <span className="text-fg-muted text-sm">Batch quantity</span>
      <span className="tabular flex items-center gap-2 text-sm">
        <span className="text-fg-muted">{formatNumber(current)}</span>
        <ArrowRight aria-label="becomes" className="text-fg-faint size-4" />
        <span className={cn('font-semibold', invalid ? 'text-danger' : 'text-fg')}>
          {next === null ? '—' : formatNumber(next)}
        </span>
      </span>
    </div>
  );
}

interface DialogActionsProps {
  formId: string;
  submitLabel: string;
  loading: boolean;
  disabled?: boolean;
}

export function DialogActions({
  formId,
  submitLabel,
  loading,
  disabled = false,
}: DialogActionsProps) {
  return (
    <>
      <DialogClose asChild>
        <Button variant="secondary">Cancel</Button>
      </DialogClose>
      <Button type="submit" form={formId} loading={loading} disabled={disabled}>
        {submitLabel}
      </Button>
    </>
  );
}

export function parseQuantity(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : null;
}
