import { X } from 'lucide-react';
import { Button, Select } from '@/design-system';
import type { ReportRow } from '@/data';
import { filterOptions, type FilterValues } from '../lib/filters';
import type { ReportFilterDef } from '../lib/reportMeta';

interface ReportFiltersProps {
  filters: readonly ReportFilterDef[];
  rows: readonly ReportRow[];
  values: FilterValues;
  onChange: (patch: FilterValues) => void;
}

export function ReportFilters({ filters, rows, values, onChange }: ReportFiltersProps) {
  const hasActive = filters.some((filter) => values[filter.key]);
  return (
    <>
      {filters.map((filter) => {
        const options = filterOptions(rows, filter.key);
        const current = values[filter.key] ?? '';
        const known = current === '' || options.includes(current);
        return (
          <Select
            key={filter.key}
            aria-label={filter.label}
            value={current}
            onChange={(event) => onChange({ [filter.key]: event.target.value || undefined })}
            wrapperClassName="md:w-48"
            options={[
              { value: '', label: filter.allLabel },
              ...(known ? [] : [{ value: current, label: current }]),
              ...options.map((option) => ({ value: option, label: option })),
            ]}
          />
        );
      })}
      {hasActive && (
        <Button
          variant="ghost"
          leadingIcon={<X className="size-4" />}
          onClick={() =>
            onChange(Object.fromEntries(filters.map((filter) => [filter.key, undefined])))
          }
        >
          Clear filters
        </Button>
      )}
    </>
  );
}
