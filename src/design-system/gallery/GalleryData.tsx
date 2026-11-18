import { useState } from 'react';
import { AlarmClock, Boxes, Download, IndianRupee, PackageOpen, TriangleAlert } from 'lucide-react';
import { formatINR, formatNumber } from '@/shared/format';
import { InView } from '../motion/InView';
import { Stagger, StaggerItem } from '../motion/Stagger';
import { useFlash } from '../motion/useFlash';
import {
  Button,
  DataTable,
  EmptyState,
  ExpiryBadge,
  Pagination,
  SkeletonCard,
  SkeletonText,
  StatCard,
  StockLevelBar,
  type ColumnDef,
} from '../primitives';
import type { ExpiryStatus } from '@/data/types';
import { GallerySection } from './GallerySection';

interface DemoRow {
  id: string;
  name: string;
  category: string;
  stock: number;
  min: number;
  price: number;
  status: ExpiryStatus;
  daysLeft: number;
}

const names = [
  'Paracetamol',
  'Amoxicillin',
  'Cetirizine',
  'Metformin',
  'Atorvastatin',
  'Omeprazole',
  'Salbutamol',
  'Vitamin D3',
];
const categories = [
  'Analgesics',
  'Antibiotics',
  'Antihistamines',
  'Antidiabetics',
  'Cardiovascular',
  'Gastrointestinal',
  'Respiratory',
  'Vitamins & Supplements',
];
const statuses: ExpiryStatus[] = [
  'VALID',
  'EXPIRING_SOON',
  'VALID',
  'EXPIRES_TODAY',
  'VALID',
  'EXPIRED',
];
const days: Record<ExpiryStatus, number> = {
  VALID: 142,
  EXPIRING_SOON: 12,
  EXPIRES_TODAY: 0,
  EXPIRED: -4,
};

const demoRows: DemoRow[] = Array.from({ length: 38 }, (_, i) => {
  const status = statuses[i % statuses.length] ?? 'VALID';
  return {
    id: `med-${i + 1}`,
    name: `${names[i % names.length]} ${[250, 500, 650][i % 3]} mg`,
    category: categories[i % categories.length] ?? 'Analgesics',
    stock: (i * 37) % 160,
    min: 40,
    price: 12 + ((i * 13) % 90),
    status,
    daysLeft: days[status],
  };
});

const columns: ColumnDef<DemoRow>[] = [
  {
    id: 'name',
    header: 'Medicine',
    cell: (r) => <span className="font-medium">{r.name}</span>,
    sortValue: (r) => r.name,
    searchValue: (r) => [r.name, r.category],
  },
  {
    id: 'category',
    header: 'Category',
    cell: (r) => r.category,
    sortValue: (r) => r.category,
    hideOnMobile: true,
  },
  {
    id: 'stock',
    header: 'Stock',
    align: 'right',
    cell: (r) => formatNumber(r.stock),
    sortValue: (r) => r.stock,
  },
  {
    id: 'level',
    header: 'Level',
    cell: (r) => <StockLevelBar stock={r.stock} minStockLevel={r.min} />,
    hideOnMobile: true,
  },
  {
    id: 'price',
    header: 'Unit price',
    align: 'right',
    cell: (r) => formatINR(r.price),
    sortValue: (r) => r.price,
  },
  {
    id: 'expiry',
    header: 'Expiry',
    cell: (r) => <ExpiryBadge status={r.status} daysLeft={r.daysLeft} />,
    sortValue: (r) => r.daysLeft,
  },
];

export function GalleryStats() {
  const [value, setValue] = useState(1284);
  return (
    <GallerySection title="Stat cards">
      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <StatCard
            label="Usable units"
            value={value}
            icon={Boxes}
            delta={{ value: 42, label: 'this week' }}
            href="#"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Stock value"
            value={482350}
            format={(v) => formatINR(Math.round(v))}
            icon={IndianRupee}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Low stock"
            value={6}
            icon={TriangleAlert}
            tone="warning"
            subLabel="Below minimum level"
            href="#"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Expires today"
            value={2}
            icon={AlarmClock}
            tone="urgent"
            delta={{ value: 1, goodWhen: 'down' }}
          />
        </StaggerItem>
      </Stagger>
      <div className="flex gap-3">
        <Button size="sm" variant="secondary" onClick={() => setValue((v) => v + 137)}>
          Bump value (count up)
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonCard />
        <div className="card p-6">
          <SkeletonText lines={4} />
        </div>
        <InView
          className="card text-fg-muted grid place-items-center p-6 text-sm"
          fallback={<SkeletonText lines={2} />}
        >
          Mounted when 30% visible
        </InView>
      </div>
    </GallerySection>
  );
}

export function GalleryTable() {
  const [flashTarget, setFlashTarget] = useState<string[]>([]);
  const flashIds = useFlash(flashTarget);
  const [page, setPage] = useState(3);
  return (
    <GallerySection title="Data table">
      <DataTable
        rows={demoRows}
        columns={columns}
        getRowId={(r) => r.id}
        caption="Demo medicines"
        searchPlaceholder="Search medicines"
        flashIds={flashIds}
        actions={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setFlashTarget([`med-${1 + Math.floor(Math.random() * 10)}`])}
            >
              Flash a row
            </Button>
            <Button variant="secondary" leadingIcon={<Download className="size-4" />}>
              Export
            </Button>
          </>
        }
        mobileCard={(r) => (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium">{r.name}</p>
              <p className="text-fg-muted text-xs">{r.category}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="tabular text-sm">{formatNumber(r.stock)}</span>
              <ExpiryBadge status={r.status} daysLeft={r.daysLeft} size="sm" />
            </div>
          </div>
        )}
      />
      <Pagination page={page} pageSize={10} total={240} onPageChange={setPage} />
      <div className="card">
        <EmptyState
          icon={PackageOpen}
          title="No batches yet"
          description="Receive stock to create the first batch for this medicine."
          action={<Button>Receive stock</Button>}
        />
      </div>
    </GallerySection>
  );
}
