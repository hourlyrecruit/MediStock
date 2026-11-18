import { SegmentedControl, Select } from '@/design-system';
import { useCategories } from '@/data';
import type { MedicineFilters as Filters, MedicineStatusFilter } from '../schemas/params';

const statusOptions: { value: MedicineStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

interface MedicineFiltersProps {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
}

export function MedicineFilters({ filters, onChange }: MedicineFiltersProps) {
  const categories = useCategories();
  const categoryOptions = [
    { value: '', label: 'All categories' },
    ...categories.map((category) => ({ value: category, label: category })),
  ];
  return (
    <>
      <Select
        aria-label="Category"
        options={categoryOptions}
        value={filters.category ?? ''}
        onChange={(event) => {
          const value = event.target.value;
          onChange({ category: categories.includes(value) ? value : undefined });
        }}
        wrapperClassName="w-full md:w-52"
      />
      <SegmentedControl
        aria-label="Status"
        options={statusOptions}
        value={filters.status}
        onChange={(status) => onChange({ status: status === 'all' ? undefined : status })}
      />
    </>
  );
}
