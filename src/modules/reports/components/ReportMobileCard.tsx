import type { ReportColumn, ReportId, ReportRow } from '@/data';
import { ReportCell } from './ReportCell';

interface ReportMobileCardProps {
  reportId: ReportId;
  columns: readonly ReportColumn[];
  row: ReportRow;
}

export function ReportMobileCard({ reportId, columns, row }: ReportMobileCardProps) {
  const [first, ...rest] = columns;
  return (
    <div className="flex flex-col gap-3">
      {first && (
        <p className="truncate">
          <ReportCell reportId={reportId} column={first} row={row} />
        </p>
      )}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {rest.map((column) => (
          <div key={column.key} className="min-w-0">
            <dt className="text-fg-muted text-xs">{column.header}</dt>
            <dd className="text-fg truncate">
              <ReportCell reportId={reportId} column={column} row={row} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
