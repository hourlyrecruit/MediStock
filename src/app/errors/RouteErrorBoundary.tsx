import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { TriangleAlert } from 'lucide-react';

export function RouteErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Something went wrong.';

  return (
    <div
      role="alert"
      className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center"
    >
      <span className="bg-danger-soft text-danger grid size-12 place-items-center rounded-full">
        <TriangleAlert aria-hidden className="size-6" />
      </span>
      <h1 className="text-xl font-semibold">This page hit a problem</h1>
      <p className="text-fg-muted">{message}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="bg-primary text-primary-fg hover:bg-primary-hover h-10 rounded-md px-4 font-medium"
        >
          Reload
        </button>
        <Link
          to="/dashboard"
          className="border-border-strong inline-flex h-10 items-center rounded-md border px-4 font-medium"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
