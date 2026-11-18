import { useState } from 'react';
import { useNavigate } from 'react-router';
import { CircleCheck, CirclePause, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button, ConfirmDialog, toast } from '@/design-system';
import { useInventoryActions, type MedicineView } from '@/data';
import { links } from '@/shared/routes';
import { useCanDeleteMedicine } from '../hooks/useMedicineData';
import { GuardedButton } from './GuardedButton';

interface MedicineActionsProps {
  medicine: MedicineView;
  onAddBatch: () => void;
  onDeleting: () => void;
}

export function useToggleMedicineActive() {
  const actions = useInventoryActions();
  return (medicine: Pick<MedicineView, 'id' | 'name' | 'isActive'>) => {
    const next = !medicine.isActive;
    const result = actions.setMedicineActive(medicine.id, next);
    if (!result.ok) {
      toast.error('Could not update status', { description: result.error.message });
      return;
    }
    const previous = result.value.previous;
    toast.info(next ? `${medicine.name} activated` : `${medicine.name} deactivated`, {
      description: next
        ? 'It is back in stock alerts and can receive new batches.'
        : 'History is kept. It no longer appears in low-stock alerts.',
      action: {
        label: 'Undo',
        onClick: () => {
          const undo = actions.setMedicineActive(medicine.id, previous);
          if (!undo.ok) toast.error('Could not undo', { description: undo.error.message });
        },
      },
    });
  };
}

export function MedicineActions({ medicine, onAddBatch, onDeleting }: MedicineActionsProps) {
  const navigate = useNavigate();
  const actions = useInventoryActions();
  const canDelete = useCanDeleteMedicine(medicine.id);
  const toggleActive = useToggleMedicineActive();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    onDeleting();
    const result = actions.deleteMedicine(medicine.id);
    if (!result.ok) {
      toast.error('Could not delete medicine', { description: result.error.message });
      throw new Error(result.error.message);
    }
    navigate(links.medicines(), { replace: true });
    toast.success(`${medicine.name} deleted`);
  };

  return (
    <>
      <Button
        variant="secondary"
        leadingIcon={<Pencil className="size-4" />}
        onClick={() => navigate(links.editMedicine(medicine.id))}
      >
        Edit
      </Button>
      <GuardedButton
        leadingIcon={<Plus className="size-4" />}
        onClick={onAddBatch}
        blockedReason={medicine.isActive ? undefined : 'Activate this medicine to add stock'}
      >
        Add batch
      </GuardedButton>
      <Button
        variant="secondary"
        leadingIcon={
          medicine.isActive ? (
            <CirclePause className="size-4" />
          ) : (
            <CircleCheck className="size-4" />
          )
        }
        onClick={() => toggleActive(medicine)}
      >
        {medicine.isActive ? 'Deactivate' : 'Activate'}
      </Button>
      <GuardedButton
        variant="ghost"
        leadingIcon={<Trash2 className="size-4" />}
        blockedReason={canDelete ? undefined : 'Has stock history — deactivate instead'}
        onClick={() => setConfirmDelete(true)}
        className={canDelete ? 'hover:text-danger' : undefined}
      >
        Delete
      </GuardedButton>
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        tone="danger"
        title={`Delete ${medicine.name}?`}
        description="It has no batches or transactions, so it can be removed safely. This cannot be undone."
        confirmLabel="Delete medicine"
        onConfirm={handleDelete}
      />
    </>
  );
}
