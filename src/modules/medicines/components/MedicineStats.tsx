import { AlarmClock, Boxes, CalendarClock, IndianRupee, Layers, XCircle } from 'lucide-react';
import { StatCard } from '@/design-system';
import type { MedicineView } from '@/data';
import { formatDate, formatINR } from '@/shared/format';
import { usableStockValue } from '../lib/medicines';

function NextExpiryTile({ date }: { date: string | null }) {
  return (
    <div className="card flex h-full min-w-0 flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-fg-muted text-sm font-medium">Next expiry</p>
        <span className="border-border-subtle bg-bg-subtle grid size-9 shrink-0 place-items-center rounded-md border">
          <CalendarClock aria-hidden className="text-fg-muted size-4" strokeWidth={1.75} />
        </span>
      </div>
      <p className="tabular text-fg text-xl font-semibold sm:text-2xl sm:whitespace-nowrap">
        {date ? formatDate(date) : '—'}
      </p>
      <p className="text-fg-muted mt-auto text-xs">
        {date ? 'Earliest usable batch' : 'No usable batches'}
      </p>
    </div>
  );
}

export function MedicineStats({ medicine }: { medicine: MedicineView }) {
  const { stock } = medicine;
  return (
    <section
      aria-label="Stock summary"
      className="grid grid-cols-2 gap-4 lg:grid-cols-3 [&>*]:min-w-0"
    >
      <StatCard
        label="Usable units"
        value={stock.usable}
        icon={Boxes}
        tone={medicine.isLowStock ? 'warning' : 'success'}
        subLabel={`Minimum ${medicine.minStockLevel}`}
        tilt={false}
      />
      <StatCard
        label="Expires today"
        value={stock.expiringToday}
        icon={AlarmClock}
        tone="urgent"
        subLabel="Usable until end of day"
        tilt={false}
      />
      <StatCard
        label="Expired"
        value={stock.expired}
        icon={XCircle}
        tone="danger"
        subLabel="Not usable, not counted"
        tilt={false}
      />
      <StatCard
        label="Batches"
        value={stock.batchCount}
        icon={Layers}
        subLabel={`${stock.total} units on hand`}
        tilt={false}
      />
      <NextExpiryTile date={stock.nextExpiry} />
      <StatCard
        label="Stock value"
        value={usableStockValue(medicine)}
        format={(value) => formatINR(Math.round(value))}
        icon={IndianRupee}
        subLabel="Usable units × unit price"
        tilt={false}
      />
    </section>
  );
}
