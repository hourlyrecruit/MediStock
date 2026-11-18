import { useEffect, useId, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ConfirmDialog,
  Field,
  Input,
  NumberInput,
  Select,
  Sheet,
  Textarea,
  toast,
} from '@/design-system';
import {
  medicineInputSchema,
  useCategories,
  useInventoryActions,
  type Medicine,
  type MedicineInput,
} from '@/data';
import { isMedicineFormField, toFormValues } from '../lib/medicines';

interface MedicineFormSheetProps {
  open: boolean;
  medicine?: Medicine;
  onClose: () => void;
  onSaved: (medicine: Medicine) => void;
}

export function MedicineFormSheet({ open, medicine, onClose, onSaved }: MedicineFormSheetProps) {
  const formId = useId();
  const actions = useInventoryActions();
  const categories = useCategories();
  const categoryOptions = useMemo(() => {
    const names =
      medicine && !categories.includes(medicine.category)
        ? [...categories, medicine.category]
        : categories;
    return names.map((category) => ({ value: category, label: category }));
  }, [categories, medicine]);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const defaults = useMemo(() => toFormValues(medicine), [medicine]);
  const isEdit = Boolean(medicine);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<MedicineInput>({
    resolver: zodResolver(medicineInputSchema),
    defaultValues: defaults,
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (open) reset(defaults);
  }, [open, defaults, reset]);

  const requestClose = () => {
    if (isSubmitting) return;
    if (isDirty) setConfirmDiscard(true);
    else onClose();
  };

  const onSubmit = handleSubmit((values) => {
    const result = medicine
      ? actions.updateMedicine({ ...values, id: medicine.id })
      : actions.createMedicine(values);
    if (!result.ok) {
      const { field, message } = result.error;
      if (isMedicineFormField(field))
        setError(field, { type: 'server', message }, { shouldFocus: true });
      else setError('root.server', { type: 'server', message });
      return;
    }
    const saved = result.value.medicine;
    reset(toFormValues(saved));
    toast.success(isEdit ? 'Medicine updated' : 'Medicine added', {
      description: `${saved.name} (${saved.genericName})`,
    });
    onSaved(saved);
  });

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(next) => {
          if (!next) requestClose();
        }}
        title={isEdit ? 'Edit medicine' : 'Add medicine'}
        description={
          isEdit
            ? 'Changes apply to the catalogue entry. Stock history stays as it is.'
            : 'Add a catalogue entry. Stock is added later as batches.'
        }
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={requestClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" form={formId} loading={isSubmitting}>
              {isEdit ? 'Save changes' : 'Add medicine'}
            </Button>
          </>
        }
      >
        <form id={formId} noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
          {errors.root?.server?.message && (
            <p
              role="alert"
              className="border-border-subtle bg-danger-soft text-danger rounded-md border px-3 py-2 text-sm"
            >
              {errors.root.server.message}
            </p>
          )}
          <Field label="Brand name" required error={errors.name?.message}>
            <Input autoComplete="off" placeholder="e.g. Paracare 650" {...register('name')} />
          </Field>
          <Field label="Generic name" required error={errors.genericName?.message}>
            <Input autoComplete="off" placeholder="e.g. Paracetamol" {...register('genericName')} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Category" required error={errors.category?.message}>
              <Select
                placeholder="Select a category"
                options={categoryOptions}
                {...register('category')}
              />
            </Field>
            <Field label="Manufacturer" required error={errors.manufacturer?.message}>
              <Input
                autoComplete="off"
                placeholder="e.g. Veridian Pharma"
                {...register('manufacturer')}
              />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Unit price"
              required
              hint="Per unit, in INR"
              error={errors.unitPrice?.message}
            >
              <NumberInput
                decimal
                prefix="₹"
                min={0}
                placeholder="0.00"
                {...register('unitPrice', { valueAsNumber: true })}
              />
            </Field>
            <Field
              label="Minimum stock"
              required
              hint="Alerts when usable units drop below this"
              error={errors.minStockLevel?.message}
            >
              <NumberInput
                min={0}
                placeholder="0"
                suffix="units"
                {...register('minStockLevel', { valueAsNumber: true })}
              />
            </Field>
          </div>
          <Field label="Description" optional error={errors.description?.message}>
            <Textarea
              rows={3}
              placeholder="Strength, form or storage notes"
              {...register('description')}
            />
          </Field>
          <label className="border-border-subtle bg-surface flex min-h-11 cursor-pointer items-start gap-3 rounded-md border p-3">
            <input
              type="checkbox"
              className="focus-ring accent-primary mt-0.5 size-4 shrink-0 cursor-pointer rounded-sm"
              {...register('isActive')}
            />
            <span className="flex flex-col gap-0.5">
              <span className="text-fg text-sm font-medium">Active</span>
              <span className="text-fg-muted text-xs">
                Inactive medicines keep their history but are left out of low-stock alerts.
              </span>
            </span>
          </label>
        </form>
      </Sheet>
      <ConfirmDialog
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        tone="danger"
        title="Discard changes?"
        description="Your edits to this form will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        onConfirm={() => {
          reset(defaults);
          onClose();
        }}
      />
    </>
  );
}
