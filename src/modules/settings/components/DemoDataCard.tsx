import { useState } from 'react';
import { DatabaseBackup, RotateCcw } from 'lucide-react';
import { Button, ConfirmDialog, toast } from '@/design-system';
import { useInventoryActions } from '@/data';
import { SettingsCard } from './SettingsCard';

export function DemoDataCard() {
  const [open, setOpen] = useState(false);
  const { resetDemoData } = useInventoryActions();

  const handleConfirm = async () => {
    try {
      await resetDemoData();
      toast.success('Demo data restored', {
        description: 'Medicines, batches and transactions were reloaded.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again.';
      toast.error('Could not reset demo data', { description: message });
      throw error;
    }
  };

  return (
    <SettingsCard
      icon={DatabaseBackup}
      title="Demo data"
      description="All data is fictional and saved in this browser only."
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-fg-muted text-sm">
          Start over by reloading the demo medicines, batches and transactions, dated relative to
          today.
        </p>
        <Button
          variant="danger"
          leadingIcon={<RotateCcw className="size-4" />}
          onClick={() => setOpen(true)}
        >
          Reset demo data
        </Button>
      </div>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        tone="danger"
        title="Reset demo data?"
        description="This reloads every medicine, batch and transaction from the demo data source, dated relative to today. Your changes, the pharmacy name and the alert threshold are reset too. This cannot be undone."
        confirmLabel="Reset demo data"
        onConfirm={handleConfirm}
      />
    </SettingsCard>
  );
}
