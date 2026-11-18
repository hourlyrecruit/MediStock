import { useEffect, useEffectEvent, useId, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  makeReceiveStockSchema,
  selectBatchViews,
  todayISO,
  useInventory,
  useInventoryActions,
  type BatchView,
  type ID,
  type ReceiveStockInput,
} from '@/data';
import { DateInput, Dialog, Field, NumberInput, Select, Textarea, toast } from '@/design-system';
import { formatDate, formatNumber } from '@/shared/format';
import { useToday } from '@/shared/hooks';
import {
  applyDomainError,
  batchOptionLabel,
  DialogActions,
  Notice,
  parseQuantity,
  QuantityPreview,
} from './dialogParts';
import type { ReceiveStockDialogProps } from './dialogProps';
import { medicineOptionsFrom } from './pickerOptions';

const FIELDS = ['batchId', 'quantity', 'date', 'remarks'] as const;

function firstUsable(batches: readonly BatchView[], medicineId: ID) {
  return batches.find((view) => view.medicineId === medicineId && view.isUsable)?.id ?? '';
}

export function ReceiveStockDialog({
  open,
  onOpenChange,
  batchId,
  medicineId,
  onDone,
}: ReceiveStockDialogProps) {
  const formId = useId();
  const today = useToday();
  const todayIso = todayISO(today);
  const actions = useInventoryActions();
  const batches = useInventory(selectBatchViews);
  const schema = useMemo(() => makeReceiveStockSchema(today), [today]);
  const preset = batchId ? batches.find((view) => view.id === batchId) : undefined;
  const initialMedicine = preset?.medicineId ?? medicineId ?? '';
  const [medicine, setMedicine] = useState(initialMedicine);

  const initialValues = (): Partial<ReceiveStockInput> => ({
    batchId: preset?.id ?? (initialMedicine ? firstUsable(batches, initialMedicine) : ''),
    date: todayIso,
    remarks: '',
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ReceiveStockInput>({ resolver: zodResolver(schema), defaultValues: initialValues() });

  const restart = useEffectEvent(() => {
    setMedicine(initialMedicine);
    reset(initialValues());
  });

  useEffect(() => {
    if (open) restart();
  }, [open, batchId, medicineId]);

  const [selectedId, quantity] = useWatch({ control, name: ['batchId', 'quantity'] });
  const selected = batches.find((view) => view.id === selectedId);
  const expired = selected?.status === 'EXPIRED';
  const amount = parseQuantity(quantity);

  const medicineOptions = useMemo(
    () => medicineOptionsFrom(batches, (view) => view.isUsable),
    [batches],
  );
  const batchOptions = useMemo(
    () =>
      batches
        .filter((view) => view.medicineId === medicine && (view.isUsable || view.id === preset?.id))
        .map((view) => ({
          value: view.id,
          label: batchOptionLabel(view),
          disabled: !view.isUsable,
        })),
    [batches, medicine, preset?.id],
  );
  const noUsableBatch = medicine !== '' && batchOptions.every((option) => option.disabled);

  const onSubmit = handleSubmit((values) => {
    const result = actions.receiveStock(values);
    if (!result.ok) {
      applyDomainError(result.error, setError, FIELDS);
      return;
    }
    const { batch, transaction } = result.value;
    toast.success(
      `Received ${formatNumber(transaction.quantityChange)} units into ${batch.batchNumber}`,
    );
    onDone?.(batch.id);
    onOpenChange(false);
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Receive stock"
      description="Add units to an existing, unexpired batch."
      footer={
        <DialogActions
          formId={formId}
          submitLabel="Receive stock"
          loading={isSubmitting}
          disabled={expired}
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
        <Field label="Medicine" required className="md:col-span-2">
          <Select
            placeholder="Select a medicine"
            value={medicine}
            options={medicineOptions}
            onChange={(event) => {
              const next = event.target.value;
              setMedicine(next);
              setValue('batchId', firstUsable(batches, next), { shouldValidate: false });
            }}
          />
        </Field>
        <Field
          label="Batch"
          required
          className="md:col-span-2"
          error={errors.batchId?.message}
          hint={selected && !expired ? `Expires ${formatDate(selected.expiryDate)}` : undefined}
        >
          <Select
            placeholder={medicine ? 'Select a batch' : 'Select a medicine first'}
            disabled={!medicine || noUsableBatch}
            options={batchOptions}
            {...register('batchId')}
            value={selectedId ?? ''}
          />
        </Field>
        {expired && selected && (
          <Notice tone="danger" className="mb-4 md:col-span-2">
            Batch {selected.batchNumber} expired on {formatDate(selected.expiryDate)}. Expired
            batches can’t receive stock — add a new batch instead.
          </Notice>
        )}
        {noUsableBatch && !expired && (
          <Notice tone="info" className="mb-4 md:col-span-2">
            This medicine has no unexpired batches. Use Add batch to record a new lot.
          </Notice>
        )}
        <Field label="Quantity" required error={errors.quantity?.message}>
          <NumberInput
            min={1}
            max={100000}
            suffix="units"
            disabled={expired}
            {...register('quantity', { valueAsNumber: true })}
          />
        </Field>
        <Field label="Date received" required error={errors.date?.message}>
          <DateInput
            min={selected?.receivedDate}
            max={todayIso}
            disabled={expired}
            {...register('date')}
          />
        </Field>
        <Field label="Remarks" optional className="md:col-span-2" error={errors.remarks?.message}>
          <Textarea
            rows={2}
            maxLength={200}
            placeholder="Invoice number, supplier"
            {...register('remarks')}
          />
        </Field>
        {selected && !expired && (
          <div className="md:col-span-2">
            <QuantityPreview
              current={selected.quantity}
              next={amount === null ? null : selected.quantity + amount}
            />
          </div>
        )}
      </form>
    </Dialog>
  );
}
