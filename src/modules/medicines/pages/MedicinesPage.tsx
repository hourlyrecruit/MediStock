import { useMemo } from 'react';
import { useLocation, useMatch, useNavigate } from 'react-router';
import { Pill, Plus, SearchX } from 'lucide-react';
import { Button, DataTable, EmptyState, PageHeader } from '@/design-system';
import { selectMedicineViews, useInventory } from '@/data';
import { useUrlState } from '@/shared/hooks';
import { links } from '@/shared/routes';
import { MedicineCard, medicineColumns } from '../components/medicineColumns';
import { MedicineFilters } from '../components/MedicineFilters';
import { MedicineFormSheet } from '../components/MedicineFormSheet';
import { filterMedicines, hasActiveFilters } from '../lib/medicines';
import { medicineFiltersSchema } from '../schemas/params';

export function MedicinesPage() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const isCreating = useMatch('/medicines/new') !== null;
  const medicines = useInventory(selectMedicineViews);
  const [filters, setFilters] = useUrlState(medicineFiltersSchema);
  const rows = useMemo(() => filterMedicines(medicines, filters), [medicines, filters]);
  const filtered = hasActiveFilters(filters);

  const openCreate = () => navigate({ pathname: links.newMedicine(), search });

  const emptyState = filtered ? (
    <EmptyState
      icon={SearchX}
      title="No medicines match these filters"
      description="Try another category or status."
      action={
        <Button
          variant="secondary"
          onClick={() => setFilters({ category: undefined, status: undefined })}
        >
          Clear filters
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={Pill}
      title="No medicines yet"
      description="Add the first medicine to start tracking its stock."
      action={
        <Button leadingIcon={<Plus className="size-4" />} onClick={openCreate}>
          Add medicine
        </Button>
      }
    />
  );

  return (
    <>
      <PageHeader
        title="Medicines"
        description="The catalogue of every medicine you stock, with usable units and the next batch to expire."
        actions={
          <Button leadingIcon={<Plus className="size-4" />} onClick={openCreate}>
            Add medicine
          </Button>
        }
      />
      <DataTable
        rows={rows}
        columns={medicineColumns}
        getRowId={(row) => row.id}
        caption="Medicines"
        searchPlaceholder="Search name or generic name"
        filters={<MedicineFilters filters={filters} onChange={setFilters} />}
        emptyState={emptyState}
        rowHref={(row) => links.medicine(row.id)}
        mobileCard={(row) => <MedicineCard medicine={row} />}
        itemLabel="medicines"
      />
      <MedicineFormSheet
        open={isCreating}
        onClose={() => navigate({ pathname: links.medicines(), search })}
        onSaved={(medicine) => navigate(links.medicine(medicine.id))}
      />
    </>
  );
}
