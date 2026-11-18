import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { CalendarCheck, Settings2 } from 'lucide-react';
import {
  DataTable,
  EmptyState,
  PageHeader,
  SegmentedControl,
  Select,
  useFlash,
  type TabOption,
} from '@/design-system';
import { useCategories, type BatchView } from '@/data';
import { AdjustStockDialog } from '@/modules/stock';
import { links, type ExpiryFilter } from '@/shared/routes';
import { ExpirySummary } from '../components/ExpirySummary';
import { buildExpiryColumns, ExpiryMobileCard } from '../components/expiryColumns';
import type { ExpiryAction } from '../components/ExpiryRowActions';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { useExpiryData } from '../hooks/useExpiryData';
import { useExpiryFilters } from '../hooks/useExpiryFilters';

const TABLE_DEFAULTS = { sort: 'expiry', dir: 'asc' } as const;

export function ExpiryPage() {
  const { filters, setStatus, setCategory, setIncludeToday, setShowEmpty } = useExpiryFilters();
  const categories = useCategories();
  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: category, label: category })),
    [categories],
  );
  const { rows, counts, alertDays } = useExpiryData(filters);
  const [dialog, setDialog] = useState<{ open: boolean; action: ExpiryAction | null }>({
    open: false,
    action: null,
  });
  const [flashTarget, setFlashTarget] = useState<string[]>([]);
  const flashIds = useFlash(flashTarget);

  const openAction = useCallback((action: ExpiryAction) => setDialog({ open: true, action }), []);
  const columns = useMemo(() => buildExpiryColumns(openAction), [openAction]);

  const chipOptions: TabOption<ExpiryFilter>[] = [
    { value: 'all', label: 'All', count: counts.all },
    { value: 'expires-today', label: 'Expires Today', count: counts['expires-today'] },
    { value: 'expiring-soon', label: 'Expiring Soon', count: counts['expiring-soon'] },
    { value: 'expired', label: 'Expired', count: counts.expired },
    { value: 'valid', label: 'Valid', count: counts.valid },
  ];

  const action = dialog.action;
  const filtered = filters.status !== 'all' || filters.category !== undefined;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        className="mb-2 max-md:mb-0"
        title="Expiry Management"
        description="Every batch in stock, earliest expiry first. Write off expired stock and act on what expires next."
        actions={
          <Link
            to={links.settings()}
            className="focus-ring border-border-subtle bg-surface text-fg-muted hover:border-border-strong hover:text-fg inline-flex min-h-9 items-center gap-2 rounded-md border px-3 text-sm transition-colors active:scale-[0.97] pointer-coarse:min-h-11"
          >
            <Settings2 aria-hidden className="size-4" />
            <span>
              Alert window: <span className="tabular text-fg font-medium">{alertDays}</span>{' '}
              {alertDays === 1 ? 'day' : 'days'}
            </span>
          </Link>
        }
      />

      <ExpirySummary counts={counts} active={filters.status} onSelect={setStatus} />

      <div className="flex flex-col gap-2">
        <SegmentedControl
          aria-label="Filter by expiry status"
          options={chipOptions}
          value={filters.status}
          onChange={setStatus}
          size="sm"
          className="self-start"
        />
        {filters.status === 'expiring-soon' && (
          <div className="text-fg-muted flex flex-wrap items-center gap-x-2 text-sm">
            <span>
              Expiring soon means 1–{alertDays} days left.
              {counts['expires-today'] > 0 &&
                ` ${counts['expires-today']} ${counts['expires-today'] === 1 ? 'batch expires' : 'batches expire'} today${filters.includeToday ? ' and ' + (counts['expires-today'] === 1 ? 'is' : 'are') + ' shown too' : ''}.`}
            </span>
            <ToggleSwitch
              checked={filters.includeToday}
              onChange={setIncludeToday}
              label="Include expiring today"
            />
          </div>
        )}
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row: BatchView) => row.id}
        caption="Batches by expiry"
        defaultState={TABLE_DEFAULTS}
        searchPlaceholder="Search medicine or batch"
        itemLabel="batches"
        flashIds={flashIds}
        filters={
          <Select
            aria-label="Filter by category"
            placeholder="All categories"
            options={categoryOptions}
            value={filters.category ?? ''}
            onChange={(event) =>
              setCategory(categories.includes(event.target.value) ? event.target.value : undefined)
            }
            wrapperClassName="w-full md:w-52"
          />
        }
        actions={
          <ToggleSwitch
            checked={filters.showEmpty}
            onChange={setShowEmpty}
            label="Show empty batches"
          />
        }
        mobileCard={(row) => <ExpiryMobileCard batch={row} onAction={openAction} />}
        emptyState={
          <EmptyState
            icon={CalendarCheck}
            title={filtered ? 'No batches match these filters' : 'No batches in stock'}
            description={
              filtered
                ? 'Try another status or category.'
                : 'Batches appear here once stock is received.'
            }
          />
        }
      />

      <AdjustStockDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((current) => ({ ...current, open }))}
        batchId={action?.batch.id}
        medicineId={action?.batch.medicineId}
        defaultDirection={action?.kind === 'write-off' ? 'DECREASE' : undefined}
        defaultReason={action?.kind === 'write-off' ? 'EXPIRED_DISPOSED' : undefined}
        onDone={(batchId) => setFlashTarget([batchId])}
      />
    </div>
  );
}
