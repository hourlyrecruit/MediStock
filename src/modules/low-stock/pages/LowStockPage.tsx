import { useCallback, useMemo, useState } from 'react';
import { PackageCheck, SearchX } from 'lucide-react';
import { Button, DataTable, EmptyState, PageHeader, Select, useFlash } from '@/design-system';
import { useCategories, type MedicineView } from '@/data';
import { AddBatchDialog, ReceiveStockDialog } from '@/modules/stock';
import { LowStockMobileCard, buildLowStockColumns } from '../components/lowStockColumns';
import type { LowStockAction } from '../components/LowStockRowActions';
import { useLowStock } from '../hooks/useLowStock';

const TABLE_DEFAULTS = { sort: 'shortfall', dir: 'desc' } as const;

export function LowStockPage() {
  const { rows, category, setCategory } = useLowStock();
  const categories = useCategories();
  const categoryOptions = useMemo(
    () => categories.map((item) => ({ value: item, label: item })),
    [categories],
  );
  const [dialog, setDialog] = useState<{ open: boolean; action: LowStockAction | null }>({
    open: false,
    action: null,
  });
  const [flashTarget, setFlashTarget] = useState<string[]>([]);
  const flashIds = useFlash(flashTarget);

  const openAction = useCallback((action: LowStockAction) => setDialog({ open: true, action }), []);
  const columns = useMemo(() => buildLowStockColumns(openAction), [openAction]);

  const action = dialog.action;
  const medicineId = action?.medicine.id;
  const onOpenChange = (open: boolean) => setDialog((current) => ({ ...current, open }));
  const onDone = () => {
    if (medicineId) setFlashTarget([medicineId]);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        className="mb-2 max-md:mb-0"
        title="Low Stock"
        description="Active medicines whose usable stock is below the minimum. Expired stock is not counted."
      />

      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row: MedicineView) => row.id}
        caption="Low-stock medicines"
        defaultState={TABLE_DEFAULTS}
        searchPlaceholder="Search name or generic"
        itemLabel="medicines"
        flashIds={flashIds}
        filters={
          <Select
            aria-label="Filter by category"
            placeholder="All categories"
            options={categoryOptions}
            value={category ?? ''}
            onChange={(event) =>
              setCategory(categories.includes(event.target.value) ? event.target.value : undefined)
            }
            wrapperClassName="w-full md:w-52"
          />
        }
        mobileCard={(row) => <LowStockMobileCard view={row} onAction={openAction} />}
        emptyState={
          category ? (
            <EmptyState
              icon={SearchX}
              title={`Nothing low in ${category}`}
              description="Every active medicine in this category is stocked above its minimum."
              action={
                <Button variant="secondary" onClick={() => setCategory(undefined)}>
                  Show all categories
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={PackageCheck}
              title="Everything is stocked above minimum."
              description="Medicines appear here as soon as their usable stock drops below the minimum level."
            />
          )
        }
      />

      <ReceiveStockDialog
        open={dialog.open && action?.kind === 'receive'}
        onOpenChange={onOpenChange}
        medicineId={action?.kind === 'receive' ? medicineId : undefined}
        onDone={onDone}
      />
      <AddBatchDialog
        open={dialog.open && action?.kind === 'add-batch'}
        onOpenChange={onOpenChange}
        medicineId={action?.kind === 'add-batch' ? medicineId : undefined}
        onDone={onDone}
      />
    </div>
  );
}
