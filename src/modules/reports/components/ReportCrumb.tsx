import type { Params } from 'react-router';
import { REPORT_LABEL } from '@/shared/labels';
import { isReportId } from '../lib/reportMeta';

export function ReportCrumb({ params }: { params: Params }) {
  return <>{isReportId(params.reportId) ? REPORT_LABEL[params.reportId] : 'Not found'}</>;
}
