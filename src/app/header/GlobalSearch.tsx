import { lazy, Suspense, useState } from 'react';
import { useUiStore } from '@/data';

const SearchPalette = lazy(() =>
  import('./SearchPalette').then((mod) => ({ default: mod.SearchPalette })),
);

export function GlobalSearch() {
  const open = useUiStore((s) => s.commandOpen);
  const [loaded, setLoaded] = useState(open);
  if (open && !loaded) setLoaded(true);
  if (!loaded) return null;

  return (
    <Suspense fallback={null}>
      <SearchPalette />
    </Suspense>
  );
}
