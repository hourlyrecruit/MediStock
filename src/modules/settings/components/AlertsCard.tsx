import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BellRing } from 'lucide-react';
import { Button, Field, NumberInput, toast } from '@/design-system';
import { settingsSchema, useInventoryActions, useInventoryStore } from '@/data';
import { formatNumber } from '@/shared/format';
import { useExpiringPreview } from '../lib/useExpiringPreview';
import { SettingsCard } from './SettingsCard';

const daysSchema = settingsSchema.pick({ expiryAlertDays: true });

function plural(count: number, noun: string) {
  return `${formatNumber(count)} ${count === 1 ? noun : `${noun}es`}`;
}

export function AlertsCard() {
  const expiryAlertDays = useInventoryStore((state) => state.settings.expiryAlertDays);
  const { updateSettings } = useInventoryActions();
  const values = useMemo(() => ({ expiryAlertDays }), [expiryAlertDays]);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({ resolver: zodResolver(daysSchema), values, mode: 'onChange' });
  const days = useWatch({ control, name: 'expiryAlertDays' });
  const preview = useExpiringPreview(days);

  const onSubmit = handleSubmit((data) => {
    const current = useInventoryStore.getState().settings;
    const result = updateSettings({
      pharmacyName: current.pharmacyName,
      expiryAlertDays: data.expiryAlertDays,
    });
    if (result.ok) {
      toast.success('Expiry alert threshold saved', {
        description: `Batches expiring within ${result.value.settings.expiryAlertDays} days are now flagged.`,
      });
    } else {
      toast.error('Could not save the threshold', { description: result.error.message });
    }
  });

  return (
    <SettingsCard
      icon={BellRing}
      title="Inventory alerts"
      description="Decide how early a batch is flagged as expiring soon."
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Field
            label="Expiry alert threshold"
            required
            error={errors.expiryAlertDays?.message}
            hint="Between 1 and 365 days. The default is 30."
            className="flex-1"
          >
            <NumberInput
              min={1}
              max={365}
              suffix="days"
              {...register('expiryAlertDays', { valueAsNumber: true })}
            />
          </Field>
          <Button type="submit" loading={isSubmitting} disabled={!isDirty} className="sm:mt-7">
            Save threshold
          </Button>
        </div>
        <p
          aria-live="polite"
          className="border-border-subtle bg-bg-subtle text-fg-muted rounded-md border px-4 py-3 text-sm"
        >
          {preview ? (
            <>
              With <span className="tabular text-fg font-medium">{days}</span> days,{' '}
              <span className="tabular text-fg font-medium">{plural(preview.total, 'batch')}</span>{' '}
              {preview.total === 1 ? 'is' : 'are'} expiring soon
              {preview.today > 0
                ? `, including ${formatNumber(preview.today)} expiring today.`
                : '.'}
            </>
          ) : (
            'Enter a whole number of days between 1 and 365 to preview its effect.'
          )}
        </p>
      </form>
    </SettingsCard>
  );
}
