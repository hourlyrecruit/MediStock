import { useState } from 'react';
import { useMatch, useNavigate, useParams } from 'react-router';
import { ArrowLeft, ArrowLeftRight, Layers, SearchX } from 'lucide-react';
import { Badge, Button, EmptyState, PageHeader, Tabs } from '@/design-system';
import type { MedicineView } from '@/data';
import { AddBatchDialog } from '@/modules/stock';
import { formatDate, formatINR, formatNumber } from '@/shared/format';
import { useUrlState } from '@/shared/hooks';
import { links } from '@/shared/routes';
import { BatchesTab } from '../components/BatchesTab';
import { MedicineActions } from '../components/MedicineActions';
import { medicineLayoutId } from '../components/medicineColumns';
import { MedicineFormSheet } from '../components/MedicineFormSheet';
import { MedicineStats } from '../components/MedicineStats';
import { LowStockBadge, MedicineStatusBadge } from '../components/MedicineStatusBadge';
import { TransactionsTab } from '../components/TransactionsTab';
import {
  useMedicineBatches,
  useMedicineTransactions,
  useMedicineView,
} from '../hooks/useMedicineData';
import { medicineTabSchema } from '../schemas/params';

export function MedicineDetailPage() {
  const { id = '' } = useParams();
  const live = useMedicineView(id);
  const [removed, setRemoved] = useState<MedicineView | null>(null);
  const medicine = live ?? removed;

  if (!medicine) return <MedicineNotFound />;
  return <MedicineDetail medicine={medicine} onDeleting={() => setRemoved(medicine)} />;
}

function MedicineNotFound() {
  const navigate = useNavigate();
  return (
    <div className="card">
      <EmptyState
        icon={SearchX}
        title="Medicine not found"
        description="It may have been deleted, or the link is out of date."
        action={
          <Button
            leadingIcon={<ArrowLeft className="size-4" />}
            onClick={() => navigate(links.medicines())}
          >
            Back to medicines
          </Button>
        }
      />
    </div>
  );
}

function DetailFacts({ medicine }: { medicine: MedicineView }) {
  const facts = [
    { label: 'Unit price', value: formatINR(medicine.unitPrice), numeric: true },
    {
      label: 'Minimum stock',
      value: `${formatNumber(medicine.minStockLevel)} units`,
      numeric: true,
    },
    { label: 'Manufacturer', value: medicine.manufacturer, numeric: false },
    { label: 'Last updated', value: formatDate(medicine.updatedAt), numeric: true },
  ];
  return (
    <section aria-label="Medicine details" className="card grid gap-6 p-5 md:grid-cols-[2fr_3fr]">
      <dl className="grid grid-cols-2 gap-4">
        {facts.map((fact) => (
          <div key={fact.label} className="min-w-0">
            <dt className="text-fg-muted text-xs">{fact.label}</dt>
            <dd
              className={
                fact.numeric ? 'tabular text-fg mt-1 text-sm' : 'text-fg mt-1 truncate text-sm'
              }
            >
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
      <div className="md:border-border-subtle min-w-0 md:border-l md:pl-6">
        <p className="text-fg-muted text-xs">Description</p>
        <p className="text-fg mt-1 text-sm">{medicine.description || 'No description.'}</p>
      </div>
    </section>
  );
}

function MedicineDetail({
  medicine,
  onDeleting,
}: {
  medicine: MedicineView;
  onDeleting: () => void;
}) {
  const navigate = useNavigate();
  const isEditing = useMatch('/medicines/:id/edit') !== null;
  const [{ tab }, setTab] = useUrlState(medicineTabSchema);
  const [addBatchOpen, setAddBatchOpen] = useState(false);
  const batches = useMedicineBatches(medicine.id);
  const transactions = useMedicineTransactions(medicine.id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        className="mb-2 max-md:mb-0"
        layoutId={medicineLayoutId(medicine.id)}
        title={medicine.name}
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral" variant="outline">
              {medicine.category}
            </Badge>
            <MedicineStatusBadge isActive={medicine.isActive} />
            {medicine.isLowStock && <LowStockBadge size="md" />}
          </div>
        }
        description={`${medicine.genericName} · ${medicine.manufacturer}`}
        actions={
          <MedicineActions
            medicine={medicine}
            onAddBatch={() => setAddBatchOpen(true)}
            onDeleting={onDeleting}
          />
        }
      />
      <MedicineStats medicine={medicine} />
      <DetailFacts medicine={medicine} />
      <Tabs
        aria-label="Medicine records"
        value={tab}
        onChange={(next) => setTab({ tab: next === 'batches' ? undefined : next })}
        items={[
          {
            value: 'batches',
            label: 'Batches',
            icon: Layers,
            count: batches.length,
            content: (
              <BatchesTab
                medicine={medicine}
                canAddBatch={medicine.isActive}
                onAddBatch={() => setAddBatchOpen(true)}
              />
            ),
          },
          {
            value: 'transactions',
            label: 'Transactions',
            icon: ArrowLeftRight,
            count: transactions.length,
            content: <TransactionsTab medicine={medicine} />,
          },
        ]}
      />
      <AddBatchDialog open={addBatchOpen} onOpenChange={setAddBatchOpen} medicineId={medicine.id} />
      <MedicineFormSheet
        open={isEditing}
        medicine={medicine}
        onClose={() => navigate(links.medicine(medicine.id), { replace: true })}
        onSaved={() => navigate(links.medicine(medicine.id), { replace: true })}
      />
    </div>
  );
}
