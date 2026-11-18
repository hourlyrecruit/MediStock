import { Spinner } from '@/design-system';

export function AppLoading() {
  return (
    <div
      aria-busy="true"
      className="bg-bg-subtle text-fg-muted grid min-h-dvh place-items-center text-sm"
    >
      <span className="inline-flex items-center gap-2">
        <Spinner size={18} className="text-primary" />
        Loading inventory…
      </span>
    </div>
  );
}
