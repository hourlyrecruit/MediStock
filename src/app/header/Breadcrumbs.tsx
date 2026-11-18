import { Fragment } from 'react';
import { Link, useMatches, type UIMatch } from 'react-router';
import { ChevronRight } from 'lucide-react';
import type { RouteHandle } from '@/shared/module';

type CrumbMatch = UIMatch<unknown, RouteHandle | undefined>;

export function useRouteHandles() {
  const matches = useMatches() as CrumbMatch[];
  return matches.filter((m) => m.handle?.crumb || m.handle?.title);
}

export function usePageTitle() {
  const handles = useRouteHandles();
  return [...handles].reverse().find((m) => m.handle?.title)?.handle?.title ?? 'MediStock';
}

export function Breadcrumbs() {
  const crumbs = useRouteHandles().filter((m) => m.handle?.crumb);
  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="hidden md:block">
      <ol className="text-fg-faint flex items-center gap-1.5 text-sm">
        <li>
          <Link to="/dashboard" className="hover:text-fg link-underline">
            Home
          </Link>
        </li>
        {crumbs.map((match, index) => {
          const crumb = match.handle?.crumb;
          const isLast = index === crumbs.length - 1;
          const content =
            typeof crumb === 'string' ? crumb : crumb ? <CrumbComponent match={match} /> : null;
          return (
            <Fragment key={match.id}>
              <ChevronRight aria-hidden className="size-3.5" />
              <li>
                {isLast ? (
                  <span aria-current="page" className="text-fg-muted font-medium">
                    {content}
                  </span>
                ) : (
                  <Link to={match.pathname} className="hover:text-fg link-underline">
                    {content}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

function CrumbComponent({ match }: { match: CrumbMatch }) {
  const Component = match.handle?.crumb;
  if (!Component || typeof Component === 'string') return null;
  return <Component params={match.params} />;
}
