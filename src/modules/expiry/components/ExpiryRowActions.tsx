import { Link } from 'react-router';
import { ArrowUpRight, SlidersHorizontal, Trash2 } from 'lucide-react';
import { Button, Tooltip, buttonBase, buttonVariants } from '@/design-system';
import type { BatchView } from '@/data';
import { cn } from '@/shared/cn';
import { links } from '@/shared/routes';

export type ExpiryAction = { kind: 'write-off' | 'adjust'; batch: BatchView };

interface ExpiryRowActionsProps {
  batch: BatchView;
  onAction: (action: ExpiryAction) => void;
  className?: string;
}

export function ExpiryRowActions({ batch, onAction, className }: ExpiryRowActionsProps) {
  const expired = batch.status === 'EXPIRED';
  const label = `View ${batch.medicine.name}`;
  return (
    <div className={cn('flex items-center justify-end gap-1', className)}>
      {expired ? (
        <Button
          size="sm"
          variant="secondary"
          disabled={batch.quantity === 0}
          leadingIcon={<Trash2 className="size-4" />}
          onClick={() => onAction({ kind: 'write-off', batch })}
          aria-label={`Write off batch ${batch.batchNumber}`}
        >
          Write off
        </Button>
      ) : (
        <Button
          size="sm"
          variant="secondary"
          leadingIcon={<SlidersHorizontal className="size-4" />}
          onClick={() => onAction({ kind: 'adjust', batch })}
          aria-label={`Adjust batch ${batch.batchNumber}`}
        >
          Adjust
        </Button>
      )}
      <Tooltip content="View medicine">
        <Link
          to={links.medicine(batch.medicineId)}
          aria-label={label}
          className={cn(buttonBase, buttonVariants.ghost, 'size-9 p-0 pointer-coarse:size-11')}
        >
          <ArrowUpRight aria-hidden className="size-4" />
        </Link>
      </Tooltip>
    </div>
  );
}
