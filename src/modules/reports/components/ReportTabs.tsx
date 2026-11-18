import { useNavigate } from 'react-router';
import { SegmentedControl, type TabOption } from '@/design-system';
import { REPORT_IDS, type ReportId } from '@/data';
import { REPORT_LABEL } from '@/shared/labels';
import { links } from '@/shared/routes';

const options: readonly TabOption<ReportId>[] = REPORT_IDS.map((id) => ({
  value: id,
  label: REPORT_LABEL[id],
}));

export function ReportTabs({ value }: { value: ReportId | undefined }) {
  const navigate = useNavigate();
  return (
    <SegmentedControl
      aria-label="Reports"
      options={options}
      value={value}
      onChange={(id) => navigate(links.report(id))}
      className="max-md:flex max-md:w-full"
    />
  );
}
