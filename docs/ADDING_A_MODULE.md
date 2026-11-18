# Adding a module

This walkthrough adds a hypothetical **Suppliers** module. It's out of scope for the current build, but the steps are the same for any feature. You'll add one folder and one registry line, and you won't edit any existing module.

## 1. Create the folder

```
src/modules/suppliers/
  components/
  hooks/
  pages/SuppliersPage.tsx
  schemas/
  routes.tsx
  module.config.ts
  index.ts
```

## 2. Define the routes

```tsx
import type { RouteObject } from 'react-router';
import type { RouteHandle } from '@/shared/module';

export const routes: RouteObject[] = [
  {
    path: 'suppliers',
    handle: { title: 'Suppliers', crumb: 'Suppliers' } satisfies RouteHandle,
    lazy: () => import('./pages/SuppliersPage').then((m) => ({ Component: m.SuppliersPage })),
  },
];
```

- The `title` becomes the page title in the header and the browser tab.
- The `crumb` becomes the breadcrumb. It can be a string, or a component that receives the route `params` (the Medicines detail page uses one to show the medicine's name).
- Every route is lazy-loaded and gets an error boundary from the router automatically.

## 3. Describe the module

```ts
import { Truck } from 'lucide-react';
import type { ModuleConfig } from '@/shared/module';
import { routes } from './routes';

export const suppliersModule: ModuleConfig = {
  id: 'suppliers',
  label: 'Suppliers',
  icon: Truck,
  path: '/suppliers',
  routes,
  navOrder: 6.5,
  layout: 'shell',
  mobileTab: false,
  breadcrumb: 'Suppliers',
};
```

Add `'suppliers'` to the `ModuleId` union in `src/shared/module.ts`. To ship the module behind a flag, add the flag to `FeatureFlag` and filter on it in `src/app/registry.ts`.

## 4. Export a public API

`index.ts` is the only file other modules may import from:

```ts
export { suppliersModule } from './module.config';
```

If other modules need a component from this one (the way Medicines and Low Stock reuse the stock dialogs from `@/modules/stock`), export it here as well.

## 5. Register it

```ts
import { suppliersModule } from '@/modules/suppliers';

export const registry: ModuleConfig[] = [
  …,
  suppliersModule,
];
```

The sidebar, mobile "More" sheet, routes, breadcrumbs and page title now include Suppliers.

## 6. Add data (if the module needs it)

1. Add types to `src/data/types.ts`, and add the new collection to `InventoryState` and its Zod schema in `src/data/store/schema.ts`.
2. Bump the persisted `version` in `src/data/store/inventoryStore.ts` and add a `migrate` step that fills in the new collection, so existing users keep their data.
3. Put derived data in a pure selector under `src/data/selectors/`, and mutations in a pure service under `src/data/services/` that returns `Result`. Add a binding for the service in `useInventoryActions()`.
4. Add the endpoint to `src/data/api` (`endpoints.ts`, `inventoryApi.ts`, `loader.ts`), add a JSON fixture in `src/data/api/mock/` and register it in `mock/server.ts`, then document it in `integration.md`.
5. Write Vitest tests for the selectors and services with a fixed `today`.

## 7. Follow the rules
- Read through `useInventory` and write through `useInventoryActions`. Never compute stock or expiry inside a component.
- Use design-system primitives and semantic tokens only, and make sure the module works in both light and dark themes.
- Keep list state (search, filters, sort, page) in the URL with `useDataTableState` / `useUrlState`.
- Don't write comments in source; explain things in docs and commit messages instead.
- Run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build` before committing.
