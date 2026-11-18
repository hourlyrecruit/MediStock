import { Link } from 'react-router';
import { Layers, PackagePlus, Plus } from 'lucide-react';
import { Button, IconButton, Tooltip, buttonBase, buttonVariants } from '@/design-system';
import type { MedicineView } from '@/data';
import { cn } from '@/shared/cn';
import { links } from '@/shared/routes';

export type LowStockAction = { kind: 'receive' | 'add-batch'; medicine: MedicineView };

interface LowStockRowActionsProps {
  medicine: MedicineView;
  onAction: (action: LowStockAction) => void;
  className?: string;
}

export function LowStockRowActions({ medicine, onAction, className }: LowStockRowActionsProps) {
  return (
    <div className={cn('flex items-center justify-end gap-1', className)}>
      <Button
        size="sm"
        variant="secondary"
        leadingIcon={<PackagePlus className="size-4" />}
        onClick={() => onAction({ kind: 'receive', medicine })}
        aria-label={`Receive stock for ${medicine.name}`}
      >
        Receive
      </Button>
      <Tooltip content="Add batch">
        <IconButton
          size="sm"
          icon={<Plus className="size-4" />}
          onClick={() => onAction({ kind: 'add-batch', medicine })}
          aria-label={`Add batch for ${medicine.name}`}
        />
      </Tooltip>
      <Tooltip content="View batches">
        <Link
          to={links.stock({ medicine: medicine.id })}
          aria-label={`View batches of ${medicine.name}`}
          className={cn(buttonBase, buttonVariants.ghost, 'size-9 p-0 pointer-coarse:size-11')}
        >
          <Layers aria-hidden className="size-4" />
        </Link>
      </Tooltip>
    </div>
  );
}
