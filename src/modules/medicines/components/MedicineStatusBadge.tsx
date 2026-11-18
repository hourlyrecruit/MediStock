import { CircleCheck, CirclePause, TriangleAlert } from 'lucide-react';
import { Badge } from '@/design-system';

interface MedicineStatusBadgeProps {
  isActive: boolean;
  size?: 'sm' | 'md';
}

export function MedicineStatusBadge({ isActive, size }: MedicineStatusBadgeProps) {
  return (
    <Badge
      tone={isActive ? 'success' : 'neutral'}
      icon={isActive ? CircleCheck : CirclePause}
      size={size}
      pulseKey={String(isActive)}
    >
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );
}

export function LowStockBadge({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <Badge tone="warning" icon={TriangleAlert} size={size}>
      Low stock
    </Badge>
  );
}
