import { Link } from 'react-router';
import { ArrowLeft, FileQuestion } from 'lucide-react';
import { buttonBase, buttonSizes, buttonVariants, Card, EmptyState } from '@/design-system';
import { cn } from '@/shared/cn';
import { links } from '@/shared/routes';

export function ReportNotFound({ reportId }: { reportId: string | undefined }) {
  return (
    <Card padded={false}>
      <EmptyState
        icon={FileQuestion}
        title="Report not found"
        description={`There is no report called “${reportId ?? ''}”. Pick a report above or start with the catalogue.`}
        action={
          <Link
            to={links.report('catalogue')}
            className={cn(
              buttonBase,
              buttonVariants.secondary,
              buttonSizes.md,
              'active:scale-[0.97]',
            )}
          >
            <ArrowLeft aria-hidden className="size-4" />
            Back to medicine catalogue
          </Link>
        }
      />
    </Card>
  );
}
