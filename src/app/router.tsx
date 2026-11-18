import { createBrowserRouter, redirect, type RouteObject } from 'react-router';
import { registry } from './registry';
import { RootLayout } from './layouts/RootLayout';
import { AppShell } from './layouts/AppShell';
import { RouteErrorBoundary } from './errors/RouteErrorBoundary';
import { NotFound } from './errors/NotFound';
import { useUiStore } from '@/data/store/uiStore';
import { loadAppData } from '@/data/api/loader';
import { AppLoading } from './layouts/AppLoading';

function withErrorBoundary(routes: RouteObject[]): RouteObject[] {
  return routes.map((route) => ({
    ...route,
    errorElement: route.errorElement ?? <RouteErrorBoundary />,
    children: route.children ? withErrorBoundary(route.children) : undefined,
  })) as RouteObject[];
}

const bareRoutes = registry.filter((m) => m.layout === 'bare').flatMap((m) => m.routes);
const shellRoutes = registry.filter((m) => m.layout === 'shell').flatMap((m) => m.routes);

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    loader: async () => {
      await loadAppData();
      return null;
    },
    shouldRevalidate: () => false,
    hydrateFallbackElement: <AppLoading />,
    children: [
      {
        index: true,
        loader: () => redirect(useUiStore.getState().hasSeenWelcome ? '/dashboard' : '/welcome'),
      },
      ...withErrorBoundary(bareRoutes),
      {
        element: <AppShell />,
        errorElement: <RouteErrorBoundary />,
        children: [
          ...withErrorBoundary(shellRoutes),
          ...(import.meta.env.DEV
            ? [
                {
                  path: 'dev/ui',
                  handle: { title: 'Design system', crumb: 'Design system' },
                  lazy: () =>
                    import('@/design-system/Gallery').then((mod) => ({
                      Component: mod.DesignSystemGallery,
                    })),
                },
              ]
            : []),
          { path: '*', handle: { title: 'Not found', crumb: 'Not found' }, element: <NotFound /> },
        ],
      },
    ],
  },
];

export function createAppRouter() {
  return createBrowserRouter(routes);
}
