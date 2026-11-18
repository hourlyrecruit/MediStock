import { ArrowDownToLine, History, MoreHorizontal, SlidersHorizontal } from 'lucide-react';
import type { BatchView } from '@/data';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownTrigger,
  IconButton,
} from '@/design-system';

export interface BatchActionHandlers {
  onReceive: (batch: BatchView) => void;
  onAdjust: (batch: BatchView) => void;
  onHistory: (batch: BatchView) => void;
}

interface BatchActionsProps extends BatchActionHandlers {
  batch: BatchView;
}

export function BatchActions({ batch, onReceive, onAdjust, onHistory }: BatchActionsProps) {
  const expired = batch.status === 'EXPIRED';
  return (
    <Dropdown>
      <DropdownTrigger>
        <IconButton
          aria-label={`Actions for batch ${batch.batchNumber}`}
          variant="ghost"
          size="sm"
          icon={<MoreHorizontal className="size-4" />}
        />
      </DropdownTrigger>
      <DropdownContent>
        <DropdownLabel>{batch.batchNumber}</DropdownLabel>
        <DropdownItem icon={ArrowDownToLine} disabled={expired} onSelect={() => onReceive(batch)}>
          {expired ? 'Receive (batch expired)' : 'Receive stock'}
        </DropdownItem>
        <DropdownItem icon={SlidersHorizontal} onSelect={() => onAdjust(batch)}>
          Adjust stock
        </DropdownItem>
        <DropdownSeparator />
        <DropdownItem icon={History} onSelect={() => onHistory(batch)}>
          View history
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  );
}
