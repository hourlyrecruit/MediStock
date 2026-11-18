import { cn } from '@/shared/cn';
import { formatNumber } from '@/shared/format';

export function signedText(value: number) {
  if (value > 0) return `+${formatNumber(value)}`;
  if (value < 0) return `−${formatNumber(-value)}`;
  return formatNumber(0);
}

export function SignedQuantity({ value, className }: { value: number; className?: string }) {
  return (
    <span
      className={cn(
        'tabular text-sm font-medium',
        value > 0 ? 'text-success' : value < 0 ? 'text-danger' : 'text-fg-muted',
        className,
      )}
    >
      {signedText(value)}
    </span>
  );
}
