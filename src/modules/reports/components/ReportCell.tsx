import { CircleCheck, CircleSlash } from 'lucide-react';
import { Badge, ExpiryBadge, TransactionTypeBadge } from '@/design-system';
import {
  EXPIRY_STATUSES,
  TRANSACTION_TYPES,
  type ExpiryStatus,
  type ReportColumn,
  type ReportId,
  type ReportRow,
  type TransactionType,
} from '@/data';
import { formatINR, formatNumber, formatSigned } from '@/shared/format';
import { EXPIRY_STATUS_LABEL, TRANSACTION_TYPE_LABEL } from '@/shared/labels';
import { cn } from '@/shared/cn';

const BATCH_REPORTS: readonly ReportId[] = ['expiring-soon', 'expired'];
const PRIMARY_KEYS = new Set(['name', 'medicine']);

function expiryStatusOf(label: string): ExpiryStatus | undefined {
  return EXPIRY_STATUSES.find((status) => EXPIRY_STATUS_LABEL[status] === label);
}

function transactionTypeOf(label: string): TransactionType | undefined {
  return TRANSACTION_TYPES.find((type) => TRANSACTION_TYPE_LABEL[type] === label);
}

interface ReportCellProps {
  reportId: ReportId;
  column: ReportColumn;
  row: ReportRow;
}

export function ReportCell({ reportId, column, row }: ReportCellProps) {
  const value = row[column.key];
  if (value === undefined || value === '') return <span className="text-fg-faint">—</span>;

  if (typeof value === 'number') {
    const text = column.header.includes('(INR)')
      ? formatINR(value)
      : column.key === 'quantityChange'
        ? formatSigned(value)
        : formatNumber(value);
    return <span className="tabular">{text}</span>;
  }

  if (column.key === 'status' && BATCH_REPORTS.includes(reportId)) {
    const status = expiryStatusOf(value);
    const daysLeft = row.daysLeft;
    if (status) {
      return (
        <ExpiryBadge
          status={status}
          daysLeft={typeof daysLeft === 'number' ? daysLeft : undefined}
          size="sm"
        />
      );
    }
  }

  if (column.key === 'status' && reportId === 'catalogue') {
    const active = value === 'Active';
    return (
      <Badge
        size="sm"
        tone={active ? 'success' : 'neutral'}
        icon={active ? CircleCheck : CircleSlash}
      >
        {value}
      </Badge>
    );
  }

  if (column.key === 'type' && reportId === 'transactions') {
    const type = transactionTypeOf(value);
    if (type) return <TransactionTypeBadge type={type} size="sm" />;
  }

  return (
    <span
      className={cn(
        PRIMARY_KEYS.has(column.key) && 'text-fg font-medium',
        column.key === 'expiryDate' && 'tabular',
      )}
    >
      {value}
    </span>
  );
}
