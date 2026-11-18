import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { z } from 'zod';
import { FilterX } from 'lucide-react';
import {
  Badge,
  Button,
  DataTableView,
  EmptyState,
  PageHeader,
  Section,
  toast,
  useDataTableState,
} from '@/design-system';
import {
  selectReportRows,
  useInventory,
  type InventoryState,
  type ReportId,
  type ReportRow,
} from '@/data';
import { downloadCsv, reportFilename, toCsv } from '@/shared/csv';
import { formatNumber } from '@/shared/format';
import { useToday, useUrlState } from '@/shared/hooks';
import { REPORT_LABEL } from '@/shared/labels';
import { applyTableState } from '@/shared/table';
import { ExportButton } from '../components/ExportButton';
import { ReportFilters } from '../components/ReportFilters';
import { ReportMobileCard } from '../components/ReportMobileCard';
import { ReportNotFound } from '../components/ReportNotFound';
import { ReportTabs } from '../components/ReportTabs';
import { applyFilters, type FilterValues } from '../lib/filters';
import { buildColumns } from '../lib/reportColumns';
import { isReportId, REPORT_META } from '../lib/reportMeta';

function plural(count: number, noun: string) {
  return `${formatNumber(count)} ${count === 1 ? noun : `${noun}s`}`;
}

export function ReportPage() {
  const { reportId } = useParams();
  const valid = isReportId(reportId);
  return (
    <>
      <PageHeader title="Reports" description="Search, filter and export inventory data as CSV." />
      <div className="mb-6">
        <ReportTabs value={valid ? reportId : undefined} />
      </div>
      {valid ? (
        <ReportView key={reportId} reportId={reportId} />
      ) : (
        <ReportNotFound reportId={reportId} />
      )}
    </>
  );
}

function ReportView({ reportId }: { reportId: ReportId }) {
  const meta = REPORT_META[reportId];
  const today = useToday();
  const select = useCallback(
    (state: InventoryState, day: Date) => selectReportRows(state, day, reportId),
    [reportId],
  );
  const report = useInventory(select);
  const [filterSchema] = useState(() =>
    z.object(Object.fromEntries(meta.filters.map((filter) => [filter.key, z.string().optional()]))),
  );
  const [filterValues, setFilterValues] = useUrlState(filterSchema);
  const [tableState, setTableState] = useDataTableState();

  const columns = useMemo(
    () => buildColumns(reportId, report.columns, report.rows),
    [reportId, report.columns, report.rows],
  );
  const filteredRows = useMemo(
    () => applyFilters(report.rows, meta.filters, filterValues as FilterValues),
    [report.rows, meta.filters, filterValues],
  );
  const visible = useMemo(
    () => applyTableState(filteredRows, columns, tableState).filtered,
    [filteredRows, columns, tableState],
  );
  const ids = useMemo(
    () => new Map(report.rows.map((row, index) => [row, String(index)])),
    [report.rows],
  );
  const getRowId = useCallback((row: ReportRow) => ids.get(row) ?? '', [ids]);

  const filtersActive = meta.filters.some((filter) => (filterValues as FilterValues)[filter.key]);
  const clearFilters = () =>
    setFilterValues(Object.fromEntries(meta.filters.map((filter) => [filter.key, undefined])));

  const handleExport = () => {
    if (visible.length === 0) return;
    downloadCsv(reportFilename(reportId, today), toCsv(report.columns, visible));
    toast.success(`Exported ${plural(visible.length, 'row')}`, {
      description: `${REPORT_LABEL[reportId]} saved as CSV.`,
    });
  };

  const EmptyIcon = meta.empty.icon;
  const emptyState =
    report.rows.length === 0 ? (
      <EmptyState icon={EmptyIcon} title={meta.empty.title} description={meta.empty.description} />
    ) : filtersActive ? (
      <EmptyState
        icon={FilterX}
        title="No rows match these filters"
        description="Try a different filter or clear them to see the full report."
        action={
          <Button variant="secondary" onClick={clearFilters}>
            Clear filters
          </Button>
        }
      />
    ) : undefined;

  return (
    <Section
      title={REPORT_LABEL[reportId]}
      description={meta.description}
      actions={
        <Badge tone="neutral" className="tabular">
          {plural(visible.length, 'row')}
        </Badge>
      }
    >
      <DataTableView
        rows={filteredRows}
        columns={columns}
        getRowId={getRowId}
        caption={REPORT_LABEL[reportId]}
        state={tableState}
        onStateChange={setTableState}
        searchPlaceholder={meta.searchPlaceholder}
        itemLabel={meta.itemLabel}
        emptyState={emptyState}
        filters={
          meta.filters.length > 0 ? (
            <ReportFilters
              filters={meta.filters}
              rows={report.rows}
              values={filterValues as FilterValues}
              onChange={setFilterValues}
            />
          ) : undefined
        }
        actions={<ExportButton count={visible.length} onExport={handleExport} />}
        mobileCard={(row) => (
          <ReportMobileCard reportId={reportId} columns={report.columns} row={row} />
        )}
      />
    </Section>
  );
}
