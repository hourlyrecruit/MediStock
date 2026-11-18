import { useId, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/design-system';

interface SettingsCardProps {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  children: ReactNode;
}

export function SettingsCard({ icon: Icon, title, description, children }: SettingsCardProps) {
  const headingId = useId();
  return (
    <Card>
      <section
        aria-labelledby={headingId}
        className="grid gap-6 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-10"
      >
        <div className="flex items-start gap-3">
          <span className="border-border-subtle bg-bg-subtle text-fg-muted grid size-9 shrink-0 place-items-center rounded-md border">
            <Icon aria-hidden className="size-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <h2 id={headingId} className="text-fg text-base font-semibold">
              {title}
            </h2>
            <p className="text-fg-muted mt-1 text-sm">{description}</p>
          </div>
        </div>
        <div className="min-w-0">{children}</div>
      </section>
    </Card>
  );
}
