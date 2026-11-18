import { PageHeader } from './primitives/PageHeader';
import { Toaster } from './primitives/Toast';
import { Badge } from './primitives/Badge';
import { ThemeSegmentedControl } from './primitives/ThemeSegmentedControl';
import { GalleryBadges, GalleryButtons, GalleryForms } from './gallery/GalleryControls';
import { GalleryStats, GalleryTable } from './gallery/GalleryData';
import { GalleryOverlays } from './gallery/GalleryOverlays';

export function DesignSystemGallery() {
  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-6 py-8 max-md:px-4">
      <PageHeader
        eyebrow={<Badge tone="primary">Dev only</Badge>}
        title="Design system"
        description="Every MediStock primitive in one place, with its interactive states."
        actions={<ThemeSegmentedControl />}
      />
      <GalleryButtons />
      <GalleryBadges />
      <GalleryForms />
      <GalleryOverlays />
      <GalleryStats />
      <GalleryTable />
      <Toaster />
    </div>
  );
}
