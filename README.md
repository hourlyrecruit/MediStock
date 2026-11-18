# MediStock

Medicine stock and expiry management for small pharmacies, medical stores and clinics. All data is loaded through a typed API client (`src/data/api`). Without a backend, it is served from JSON fixtures in `src/data/api/mock/` and changes persist in the browser's `localStorage`. Set `VITE_API_BASE_URL` to point it at a real backend. See [integration.md](integration.md) for every endpoint and field.

- Batch-wise stock: add batches, receive stock, and adjust quantities with a reason
- Expiry tracking per batch (Valid / Expiring Soon / Expires Today / Expired), with a configurable alert window
- Low-stock alerts based on *usable* stock (expired stock never counts)
- An immutable transaction history
- Six CSV reports
- A dashboard with live KPIs and charts
- A ⌘K / Ctrl+K command palette and a notification bell
- Light / Dark / Auto themes
- A 3D welcome screen with a static fallback

## Getting started

Requires Node 20+ (developed on Node 26).

```bash
npm install
npm run dev
```

Open http://localhost:5173. The first visit shows the welcome screen; after that `/` opens the dashboard. The logo always links back to the welcome screen.

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | ESLint (TypeScript, React Hooks, jsx-a11y, module-boundary rules) |
| `npm test` | Vitest unit and component tests |
| `npm run format` | Prettier (with the Tailwind class sorter) |
| `npx vite build --mode analyze` | Build and write `stats.html` with the bundle breakdown |
| `node scripts/fetch-images.mjs` | Re-download the source photos and regenerate the image manifest |

On low-memory machines, run the tests with `npx vitest run --maxWorkers=2`.

## Tech stack

React 19.3 · React Router 8 (data mode, lazy routes) · TypeScript (strict) · Vite 8 · Tailwind CSS v4 · framer-motion · three.js + React Three Fiber 9 + drei · Recharts 3 · lucide-react · React Hook Form + Zod 4 · date-fns 4 · zustand (with `persist`) · Radix primitives · cmdk · Vitest + Testing Library.

## Folder structure

```
src/
  app/            App shell: registry, router, layouts (sidebar, header, mobile tab bar), error boundaries
  design-system/  Tokens (CSS variables), primitives (Button, Dialog, DataTable, Toast…), motion helpers
  three/          3D hero and accent scenes (lazy-loaded, with a capability gate and static fallbacks)
  data/           types · api (client, endpoints, JSON fixtures) · store (persisted, versioned) · selectors (pure) · services (pure) · hooks
  modules/        One folder per feature: welcome, dashboard, medicines, stock, expiry,
                  low-stock, transactions, reports, settings
  shared/         Formatters, CSV, table helpers, routes/links, labels, hooks
  assets/images/  Committed source photos, the manifest and ResponsiveImage
docs/             REQUIREMENTS.md, FRONTEND_PLAN.md, ADDING_A_MODULE.md, IMAGE_CREDITS.md
```

## Architecture

### Module registry
Every feature lives in `src/modules/<id>/` and exports a `module.config.ts` (`id`, `label`, `icon`, `path`, `routes`, `navOrder`, `layout`, `mobileTab`, `breadcrumb`). `src/app/registry.ts` lists the modules; the router, sidebar, mobile tab bar, breadcrumbs and page titles are all generated from it. Adding a module means adding one folder and one registry line; see [`docs/ADDING_A_MODULE.md`](docs/ADDING_A_MODULE.md).

### Module boundaries
Modules may import only from:
- `@/design-system`
- `@/three`
- `@/data`
- `@/shared`
- another module's public `index.ts`, e.g. the stock dialogs from `@/modules/stock`

They never import `@/app` or another module's internals. ESLint enforces this.

### Data flow
- **Reads** go through pure selectors, using `useInventory((state, today) => selectX(state, today))`.
- **Writes** go through pure services, using `useInventoryActions()`. Each service validates its input with the same Zod schema the form uses. It then updates the batch and appends exactly one immutable transaction, and returns a `Result` with either a value or a typed `DomainError`.
- In development, an invariant check runs after every change:
  - no negative stock
  - each batch's opening quantity plus its transactions equals its current quantity
  - every reference points to a record that exists

Components never compute stock or expiry inline, so the dashboard, alerts, notification count and reports all update together.

### "Today"
`useToday()` returns the start of the current day and re-renders at local midnight. Selectors receive `today` as an argument, which makes them deterministic and easy to test with a fixed date.

## Data model

| Entity | Key fields |
|---|---|
| `Medicine` | `name`, `genericName`, `category`, `manufacturer`, `unitPrice` (INR), `minStockLevel`, `description`, `isActive` |
| `Batch` | `medicineId`, `batchNumber`, `openingQuantity`, `quantity`, `receivedDate`, `expiryDate` |
| `StockTransaction` | `type` (`BATCH_CREATED` / `STOCK_IN` / `ADJUSTMENT_INCREASE` / `ADJUSTMENT_DECREASE`), signed `quantityChange`, `quantityAfter`, `date`, `reason?`, `remarks?` |
| `Settings` | `pharmacyName`, `currency` (`INR`), `expiryAlertDays` (default 30) |

### Business rules
- **Expiry status per batch:** status is calculated against today, counting whole days.

  | Days left | Status |
  |---|---|
  | below 0 | Expired |
  | exactly 0 | Expires Today (still usable) |
  | 1 to the alert window | Expiring Soon |
  | more than the alert window | Valid |

- **Usable stock:** the sum of all non-expired batch quantities. Expired quantity is shown separately.
- **Low stock:** an *active* medicine whose usable stock is below its minimum. Inactive medicines are excluded.
- **No negative stock:** enforced in the forms, in the services and by the invariant check.
- **Adjustments:** every adjustment needs a reason, and "Other" also requires remarks. Expired batches can only be adjusted downward, to write them off.
- **Opening balances:** batches that existed before the history window carry an `openingQuantity`. The batch history shows it as the first row.
- **Deleting medicines:** a medicine can be deleted only if it has no batches and no transactions. Otherwise, deactivate it instead.

## Demo data and reset
The demo data lives in `src/data/api/mock/*.json` (one file per endpoint) and has:
- 25 medicines across 8 categories, 4 of them inactive
- 38 batches
- 30 transactions

Fixture dates are written for `mock/meta.json → referenceDate` and are shifted to today on load, so there are always valid, expiring-soon, expiring-today and expired batches, and several low-stock medicines.

To restore it, go to **Settings → Demo data → Reset demo data** and confirm. The fixtures are reloaded and dated relative to the current date. The card is only shown in mock mode. Your theme and sidebar preferences are kept, because they are stored separately (`medistock:ui`).

## Design tokens
All visual values are CSS variables in `src/design-system/tokens/index.css`, exposed to Tailwind through `@theme`. Components use semantic utilities only (`bg-surface`, `text-fg-muted`, `border-border-subtle`, `bg-primary`, `text-warning`, `chart-1…8`).

- **Palette:** minimal. A warm off-white canvas, near-black ink, hairline borders, and a single muted deep-green accent (`#1F6B4F`). Status colors appear only in small badges, always together with an icon and a text label.
- **Themes:** light and dark values are both defined. The theme is set by `data-theme` on `<html>`, chosen from the header theme menu or Settings, and applied before first paint.
- **Typography:** SF Pro / Inter Variable on a 12/14/16/20/24/32/48 scale. Display text has tight tracking, and every number uses tabular figures.
- **Radii:** 8/12/16/20 px. **Shadows:** `xs`, `card` and `raised`.
- **Motion:** spring presets (`snappy`, `smooth`, `gentle`) in `src/design-system/motion/tokens.ts`. `prefers-reduced-motion` is respected everywhere.

## Performance
- Routes are lazy-loaded.
- framer-motion runs through `LazyMotion`, which loads its animation features asynchronously.
- three.js and Recharts load in their own lazy chunks.
- The 3D scene only renders when the device can handle it (WebGL2, enough memory and cores, no reduced motion, no data saver). Otherwise a static render is shown.
- Rendering pauses when the scene is off-screen or the tab is hidden. If the frame rate stays low, the scene first drops to 1× pixel ratio and only then falls back to the static render. If the browser drops the WebGL context (common on phones after backgrounding), the static render shows and the scene is rebuilt, up to two times.
- Images are served as AVIF/WebP `srcset`s with explicit dimensions and a blur-up placeholder.

## Image credits
See [`docs/IMAGE_CREDITS.md`](docs/IMAGE_CREDITS.md). The photos are free-licence Unsplash images, downloaded once and committed (they are not hotlinked).
