import { isMatch, parse } from 'date-fns';
import type { ColumnDef } from '@/design-system';
import type { ReportColumn, ReportId, ReportRow } from '@/data';
import { ReportCell } from '../components/ReportCell';

const DATE_FORMAT = 'dd MMM yyyy';
const REFERENCE_DATE = new Date(2000, 0, 1);
const SECONDARY_COLUMNS = new Set(['genericName', 'manufacturer']);

function sortValue(value: ReportRow[string] | undefined) {
  if (typeof value === 'string' && value.length === 11 && isMatch(value, DATE_FORMAT)) {
    return parse(value, DATE_FORMAT, REFERENCE_DATE);
  }
  return value;
}

function isNumericColumn(rows: readonly ReportRow[], key: string) {
  return rows.length > 0 && rows.every((row) => typeof row[key] === 'number');
}

export function buildColumns(
  reportId: ReportId,
  columns: readonly ReportColumn[],
  rows: readonly ReportRow[],
): ColumnDef<ReportRow>[] {
  return columns.map((column) => {
    const numeric = isNumericColumn(rows, column.key);
    return {
      id: column.key,
      header: column.header,
      align: numeric ? 'right' : 'left',
      hideBelowXl: SECONDARY_COLUMNS.has(column.key),
      cell: (row) => <ReportCell reportId={reportId} column={column} row={row} />,
      sortValue: (row) => sortValue(row[column.key]),
      searchValue: numeric ? undefined : (row) => row[column.key],
    };
  });
}
