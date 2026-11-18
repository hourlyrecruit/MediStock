import { PackageX, TriangleAlert } from 'lucide-react';
import { Badge } from '@/design-system';
import type { MedicineView } from '@/data';

export function isOutOfStock(view: MedicineView) {
  return view.stock.usable === 0;
}

export function SeverityBadge({ view, size }: { view: MedicineView; size?: 'sm' | 'md' }) {
  return isOutOfStock(view) ? (
    <Badge tone="danger" icon={PackageX} size={size}>
      Out of stock
    </Badge>
  ) : (
    <Badge tone="warning" icon={TriangleAlert} size={size}>
      Low stock
    </Badge>
  );
}
