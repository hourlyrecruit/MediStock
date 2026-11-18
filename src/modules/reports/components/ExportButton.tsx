import { Download } from 'lucide-react';
import { Button, Tooltip } from '@/design-system';

interface ExportButtonProps {
  count: number;
  onExport: () => void;
}

export function ExportButton({ count, onExport }: ExportButtonProps) {
  const button = (
    <Button
      variant="secondary"
      leadingIcon={<Download className="size-4" />}
      disabled={count === 0}
      onClick={onExport}
    >
      Export CSV
    </Button>
  );
  if (count > 0) return button;
  return (
    <Tooltip content="There are no rows to export">
      <span className="inline-flex cursor-not-allowed rounded-md">{button}</span>
    </Tooltip>
  );
}
