import { useEffect, useId, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  makeAddBatchSchema,
  selectMedicineViews,
  todayISO,
  useInventory,
  useInventoryActions,
  type AddBatchInput,
} from '@/data';
import {
  DateInput,
  Dialog,
  Field,
  Input,
  NumberInput,
  Select,
  Textarea,
  toast,
} from '@/design-system';
import { formatNumber } from '@/shared/format';
import { useToday } from '@/shared/hooks';
import { applyDomainError, DialogActions, Notice } from './dialogParts';
import type { AddBatchDialogProps } from './dialogProps';

const FIELDS = [
  'medicineId',
  'batchNumber',
  'quantity',
  'receivedDate',
  'expiryDate',
  'remarks',
] as const;

export function AddBatchDialog({ open, onOpenChange, medicineId, onDone }: AddBatchDialogProps) {
  const formId = useId();
  const today = useToday();
  const todayIso = todayISO(today);
  const actions = useInventoryActions();
  const medicines = useInventory(selectMedicineViews);
  const schema = useMemo(() => makeAddBatchSchema(today), [today]);
  const locked = medicineId ? medicines.find((medicine) => medicine.id === medicineId) : undefined;
  const activeOptions = useMemo(
    () =>
      medicines
        .filter((medicine) => medicine.isActive)
        .map((medicine) => ({ value: medicine.id, label: medicine.name })),
    [medicines],
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddBatchInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      medicineId: medicineId ?? '',
      batchNumber: '',
      receivedDate: todayIso,
      expiryDate: '',
      remarks: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        medicineId: medicineId ?? '',
        batchNumber: '',
        receivedDate: todayIso,
        expiryDate: '',
        remarks: '',
      });
    }
  }, [open, medicineId, todayIso, reset]);

  const inactive = locked ? !locked.isActive : false;

  const onSubmit = handleSubmit((values) => {
    const result = actions.addBatch(values);
    if (!result.ok) {
      applyDomainError(result.error, setError, FIELDS);
      return;
    }
    const { batch } = result.value;
    const name = medicines.find((item) => item.id === batch.medicineId)?.name;
    toast.success(`Added batch ${batch.batchNumber} with ${formatNumber(batch.quantity)} units`, {
      description: name,
    });
    onDone?.(batch.id);
    onOpenChange(false);
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add batch"
      description="Record a new lot with its own batch number and expiry date."
      footer={
        <DialogActions
          formId={formId}
          submitLabel="Add batch"
          loading={isSubmitting}
          disabled={inactive}
        />
      }
    >
      <form
        id={formId}
        noValidate
        onSubmit={onSubmit}
        className="grid gap-x-4 gap-y-1 md:grid-cols-2"
      >
        {errors.root?.server?.message && (
          <Notice tone="danger" className="mb-3 md:col-span-2">
            {errors.root.server.message}
          </Notice>
        )}
        <Field
          label="Medicine"
          required
          className="md:col-span-2"
          error={
            errors.medicineId?.message ??
            (inactive && locked ? `${locked.name} is inactive. Activate it first.` : undefined)
          }
        >
          {locked ? (
            <Input readOnly value={locked.name} />
          ) : (
            <Select
              placeholder="Select a medicine"
              options={activeOptions}
              {...register('medicineId')}
            />
          )}
        </Field>
        <Field
          label="Batch number"
          required
          error={errors.batchNumber?.message}
          hint="Letters, numbers and hyphens"
        >
          <Input
            autoComplete="off"
            placeholder="PCM-2611-A"
            className="uppercase"
            {...register('batchNumber')}
          />
        </Field>
        <Field label="Quantity" required error={errors.quantity?.message}>
          <NumberInput
            min={1}
            max={100000}
            suffix="units"
            {...register('quantity', { valueAsNumber: true })}
          />
        </Field>
        <Field label="Received date" required error={errors.receivedDate?.message}>
          <DateInput max={todayIso} {...register('receivedDate')} />
        </Field>
        <Field label="Expiry date" required error={errors.expiryDate?.message}>
          <DateInput min={todayIso} {...register('expiryDate')} />
        </Field>
        <Field label="Remarks" optional className="md:col-span-2" error={errors.remarks?.message}>
          <Textarea
            rows={2}
            maxLength={200}
            placeholder="Supplier invoice, notes"
            {...register('remarks')}
          />
        </Field>
      </form>
    </Dialog>
  );
}
