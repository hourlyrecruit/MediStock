import { IndianRupee } from 'lucide-react';
import { formatINR } from '@/shared/format';
import { SettingsCard } from './SettingsCard';

export function CurrencyCard() {
  return (
    <SettingsCard
      icon={IndianRupee}
      title="Currency"
      description="Prices and stock values are shown in Indian rupees."
    >
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="border-border-subtle rounded-md border px-4 py-3">
          <dt className="text-fg-muted text-xs">Currency</dt>
          <dd className="text-fg mt-1 text-sm font-medium">Indian rupee (INR)</dd>
        </div>
        <div className="border-border-subtle rounded-md border px-4 py-3">
          <dt className="text-fg-muted text-xs">Sample amount</dt>
          <dd className="tabular text-fg mt-1 text-sm font-medium">{formatINR(1234.5)}</dd>
        </div>
      </dl>
      <p className="text-fg-muted mt-3 text-sm">
        Amounts use Indian digit grouping, so one lakh reads as{' '}
        <span className="tabular text-fg">{formatINR(100000)}</span>. Currency is fixed for this
        app.
      </p>
    </SettingsCard>
  );
}
