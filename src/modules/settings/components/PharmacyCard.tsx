import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Store } from 'lucide-react';
import { Button, Field, Input, toast } from '@/design-system';
import { settingsSchema, useInventoryActions, useInventoryStore } from '@/data';
import { SettingsCard } from './SettingsCard';

const nameSchema = settingsSchema.pick({ pharmacyName: true });

export function PharmacyCard() {
  const pharmacyName = useInventoryStore((state) => state.settings.pharmacyName);
  const { updateSettings } = useInventoryActions();
  const values = useMemo(() => ({ pharmacyName }), [pharmacyName]);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({ resolver: zodResolver(nameSchema), values, mode: 'onTouched' });

  const onSubmit = handleSubmit((data) => {
    const current = useInventoryStore.getState().settings;
    const result = updateSettings({
      pharmacyName: data.pharmacyName,
      expiryAlertDays: current.expiryAlertDays,
    });
    if (result.ok)
      toast.success('Pharmacy name saved', {
        description: `Showing as “${result.value.settings.pharmacyName}”.`,
      });
    else toast.error('Could not save the pharmacy name', { description: result.error.message });
  });

  return (
    <SettingsCard
      icon={Store}
      title="Pharmacy"
      description="How your pharmacy or clinic is named across MediStock."
    >
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col gap-4 sm:flex-row sm:items-start"
      >
        <Field
          label="Display name"
          required
          error={errors.pharmacyName?.message}
          hint="2 to 60 characters."
          className="flex-1"
        >
          <Input autoComplete="organization" {...register('pharmacyName')} />
        </Field>
        <Button type="submit" loading={isSubmitting} disabled={!isDirty} className="sm:mt-7">
          Save name
        </Button>
      </form>
    </SettingsCard>
  );
}
