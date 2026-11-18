import { useEffect, useEffectEvent, useId, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Minus, Plus } from 'lucide-react';
import {
  ADJUSTMENT_REASONS,
  adjustStockSchema,
  selectBatchViews,
  useInventory,
  useInventoryActions,
  type AdjustStockInput,
  type BatchView,
  type ID,
} from '@/data';
import {
  Dialog,
  Field,
  NumberInput,
  SegmentedControl,
  Select,
  Textarea,
  toast,
} from '@/design-system';
import { formatNumber } from '@/shared/format';
import { ADJUSTMENT_REASON_LABEL } from '@/shared/labels';
import {
  applyDomainError,
  batchOptionLabel,
  DialogActions,
  Notice,
  parseQuantity,
  QuantityPreview,
} from './dialogParts';
import type { AdjustStockDialogProps } from './dialogProps';
import { medicineOptionsFrom } from './pickerOptions';

type Direction = AdjustStockInput['direction'];

const FIELDS = ['batchId', 'direction', 'quantity', 'reason', 'remarks'] as const;

const REASON_OPTIONS = ADJUSTMENT_REASONS.map((reason) => ({
  value: reason,
  label: ADJUSTMENT_REASON_LABEL[reason],
}));

function firstBatch(batches: readonly BatchView[], medicineId: ID) {
  const own = batches.filter((view) => view.medicineId === medicineId);
  return (own.find((view) => view.quantity > 0) ?? own[0])?.id ?? '';
}

function allowedDirection(view: BatchView | undefined, wanted: Direction): Direction {
  return view?.status === 'EXPIRED' ? 'DECREASE' : wanted;
}

export function AdjustStockDialog({
  open,
  onOpenChange,
  batchId,
  medicineId,
  defaultDirection = 'DECREASE',
  defaultReason,
  onDone,
}: AdjustStockDialogProps) {
  const formId = useId();
  const actions = useInventoryActions();
  const batches = useInventory(selectBatchViews);
  const preset = batchId ? batches.find((view) => view.id === batchId) : undefined;
  const initialMedicine = preset?.medicineId ?? medicineId ?? '';
  const [medicine, setMedicine] = useState(initialMedicine);

  const initialValues = (): Partial<AdjustStockInput> => {
    const id = preset?.id ?? (initialMedicine ? firstBatch(batches, initialMedicine) : '');
    return {
      batchId: id,
      direction: allowedDirection(
        batches.find((view) => view.id === id),
        defaultDirection,
      ),
      reason: defaultReason,
      remarks: '',
    };
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AdjustStockInput>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: initialValues(),
  });

  const restart = useEffectEvent(() => {
    setMedicine(initialMedicine);
    reset(initialValues());
  });

  useEffect(() => {
    if (open) restart();
  }, [open, batchId, medicineId]);

  const [selectedId, direction, quantity, reason] = useWatch({
    control,
    name: ['batchId', 'direction', 'quantity', 'reason'],
  });
  const selected = batches.find((view) => view.id === selectedId);
  const expired = selected?.status === 'EXPIRED';
  const amount = parseQuantity(quantity);
  const sign = direction === 'INCREASE' ? 1 : -1;
  const next = selected && amount !== null ? selected.quantity + sign * amount : null;
  const negative = next !== null && next < 0;
  const negativeMessage =
    negative && selected
      ? `Only ${formatNumber(selected.quantity)} ${selected.quantity === 1 ? 'unit is' : 'units are'} available in ${selected.batchNumber}`
      : undefined;
  const isOther = reason === 'OTHER';

  const medicineOptions = useMemo(() => medicineOptionsFrom(batches, () => true), [batches]);
  const batchOptions = useMemo(
    () =>
      batches
        .filter((view) => view.medicineId === medicine)
        .map((view) => ({ value: view.id, label: batchOptionLabel(view) })),
    [batches, medicine],
  );

  const chooseBatch = (id: ID) => {
    setValue('batchId', id);
    const view = batches.find((item) => item.id === id);
    if (view?.status === 'EXPIRED') setValue('direction', 'DECREASE');
  };

  const onSubmit = handleSubmit((values) => {
    if (negative) return;
    const result = actions.adjustStock(values);
    if (!result.ok) {
      applyDomainError(result.error, setError, FIELDS);
      return;
    }
    const { batch, transaction } = result.value;
    const verb = transaction.quantityChange > 0 ? 'Added' : 'Removed';
    const preposition = transaction.quantityChange > 0 ? 'to' : 'from';
    toast.success(
      `${verb} ${formatNumber(Math.abs(transaction.quantityChange))} units ${preposition} ${batch.batchNumber}`,
      {
        description: transaction.reason ? ADJUSTMENT_REASON_LABEL[transaction.reason] : undefined,
      },
    );
    onDone?.(batch.id);
    onOpenChange(false);
  });

  const quantityRegistration = register('quantity', { valueAsNumber: true });
  const batchRegistration = register('batchId');

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Adjust stock"
      description="Correct a batch quantity. Every adjustment is logged with its reason."
      footer={
        <DialogActions
          formId={formId}
          submitLabel="Save adjustment"
          loading={isSubmitting}
          disabled={negative}
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
              const nextMedicine = event.target.value;
              setMedicine(nextMedicine);
              chooseBatch(firstBatch(batches, nextMedicine));
            }}
          />
        </Field>
        <Field label="Batch" required className="md:col-span-2" error={errors.batchId?.message}>
          <Select
            placeholder={medicine ? 'Select a batch' : 'Select a medicine first'}
            disabled={!medicine}
            options={batchOptions}
            {...batchRegistration}
            value={selectedId ?? ''}
            onChange={(event) => {
              void batchRegistration.onChange(event);
              chooseBatch(event.target.value);
            }}
          />
        </Field>
        <div className="mb-5 flex flex-col gap-2 md:col-span-2">
          <span className="text-fg text-sm font-medium">Direction</span>
          <SegmentedControl<Direction>
            aria-label="Direction"
            value={direction}
            onChange={(value) => {
              setValue('direction', value);
              clearErrors('quantity');
            }}
            options={[
              { value: 'INCREASE', label: 'Increase', icon: Plus, disabled: expired },
              { value: 'DECREASE', label: 'Decrease', icon: Minus },
            ]}
          />
          {expired && (
            <p className="text-fg-muted text-xs">
              This batch has expired, so it can only be decreased (for example, written off as
              disposed).
            </p>
          )}
        </div>
        <Field label="Quantity" required error={errors.quantity?.message ?? negativeMessage}>
          <NumberInput min={1} max={100000} suffix="units" {...quantityRegistration} />
        </Field>
        <Field label="Reason" required error={errors.reason?.message}>
          <Select placeholder="Select a reason" options={REASON_OPTIONS} {...register('reason')} />
        </Field>
        <Field
          label="Remarks"
          required={isOther}
          optional={!isOther}
          hint={isOther ? 'Required — explain what happened' : undefined}
          className="md:col-span-2"
          error={errors.remarks?.message}
        >
          <Textarea
            rows={2}
            maxLength={200}
            placeholder="What happened?"
            {...register('remarks')}
          />
        </Field>
        {selected && (
          <div className="md:col-span-2">
            <QuantityPreview current={selected.quantity} next={next} invalid={negative} />
          </div>
        )}
      </form>
    </Dialog>
  );
}
