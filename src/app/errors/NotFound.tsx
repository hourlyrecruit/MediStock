import { Link } from 'react-router';
import { SearchX } from 'lucide-react';

export function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
      <span className="bg-primary-tint text-primary grid size-14 place-items-center rounded-2xl">
        <SearchX aria-hidden className="size-7" />
      </span>
      <h2 className="text-xl font-semibold">We couldn’t find that page</h2>
      <p className="text-fg-muted">The link may be outdated, or the page has moved.</p>
      <Link
        to="/dashboard"
        className="bg-primary text-primary-fg hover:bg-primary-hover inline-flex h-10 items-center rounded-md px-4 font-medium"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
