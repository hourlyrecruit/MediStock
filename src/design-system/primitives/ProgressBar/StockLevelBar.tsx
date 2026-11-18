import { cn } from '@/shared/cn';
import { formatNumber } from '@/shared/format';
import type { Tone } from '../internal/tones';
import { ProgressBar } from './ProgressBar';

interface StockLevelBarProps {
  stock: number;
  minStockLevel: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

function stockTone(stock: number, min: number): Tone {
  if (stock <= 0) return 'danger';
  if (stock < min) return stock < min / 2 ? 'urgent' : 'warning';
  return 'success';
}

export function StockLevelBar({
  stock,
  minStockLevel,
  label = 'Stock level',
  showValue,
  className,
}: StockLevelBarProps) {
  const max = Math.max(minStockLevel * 2, stock, 1);
  const text = `${formatNumber(stock)} of ${formatNumber(minStockLevel)} minimum`;
  return (
    <div className={cn('flex min-w-24 items-center gap-2', className)}>
      <ProgressBar
        value={stock}
        max={max}
        tone={stockTone(stock, minStockLevel)}
        label={label}
        valueText={text}
      />
      {showValue && (
        <span className="tabular text-fg-muted shrink-0 text-xs">{formatNumber(stock)}</span>
      )}
    </div>
  );
}
