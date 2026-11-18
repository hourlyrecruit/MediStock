import type { ReactNode } from 'react';
import { Card } from '../primitives/Card';
import { Section } from '../primitives/Section';

export function GallerySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Section title={title}>
      <Card className="flex flex-col gap-6">{children}</Card>
    </Section>
  );
}
