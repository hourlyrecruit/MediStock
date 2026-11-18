# MediStock — UI Documentation

Version 0.1.0 · Medicine stock and expiry management for small pharmacies, medical stores and clinics.

---

## Contents

1. Overview
2. Getting started
3. Tech stack
4. Project structure
5. Architecture
6. Application shell and navigation
7. Screens
8. Business rules
9. Data layer
10. Backend integration
11. Design system
12. Theming and motion
13. Responsive behaviour
14. Accessibility
15. Performance
16. Testing and quality gates
17. Extending the app
18. Conventions and rules
19. Reference

---

## 1. Overview

MediStock is a single-page React application for tracking medicine inventory **batch by batch**. It answers three questions for a pharmacy:

- **What do I have?** Usable stock per medicine and per batch, valued in INR.
- **What is about to go bad?** Expiry status per batch, with a configurable alert window.
- **What do I need to reorder?** Active medicines whose usable stock has fallen below their minimum level.

Every stock change creates an immutable transaction, so the history always explains the current quantity.

### Key features

| Area | What it provides |
|---|---|
| Welcome | A 3D hero screen with live KPI chips, shown on first visit |
| Dashboard | KPI cards, category distribution chart, monthly stock additions chart, low-stock and expiry tables |
| Medicines | Catalogue with search, filters, sort, pagination; create, edit, activate/deactivate, delete |
| Stock Management | Every batch on hand; add batch, receive stock, adjust stock, per-batch history |
| Expiry Management | Batches by expiry status, days left, write-off of expired stock |
| Low Stock | Active medicines below minimum, with shortfall and one-click restock |
| Transactions | Read-only log of every stock movement with type and date filters |
| Reports | Six reports with search, filters and CSV export |
| Settings | Pharmacy name, expiry alert window, currency, theme, motion, demo-data reset |
| Global | ⌘K / Ctrl+K command palette, notification bell, breadcrumbs, Light / Dark / Auto themes |

### Operating modes

| Mode | When | Data source | Persistence |
|---|---|---|---|
| **Mock** | `VITE_API_BASE_URL` is empty (default) | JSON fixtures in `src/data/api/mock/` | Browser `localStorage` (`medistock:inventory`) |
| **HTTP** | `VITE_API_BASE_URL` is set | A real REST backend | The server |

---

## 2. Getting started

### Requirements

- Node.js 20 or newer (developed on Node 26)
- npm
- A modern browser (Chrome, Edge, Firefox, Safari). WebGL2 is optional; without it the 3D scenes fall back to static images.

### Install and run

```bash
npm install
npm run dev
```

Open http://localhost:5173. The first visit shows the welcome screen. After you enter the dashboard, `/` opens the dashboard directly. The logo always links back to the welcome screen.

### Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server with hot reload |
| `npm run build` | Type-check (`tsc -b`) and production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | ESLint: TypeScript, React Hooks, jsx-a11y and module-boundary rules |
| `npm test` | Vitest unit and component tests (single run) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run format` | Prettier with the Tailwind class sorter |
| `npx vite build --mode analyze` | Build and write `stats.html` with the bundle breakdown |
| `node scripts/fetch-images.mjs` | Re-download source photos and regenerate the image manifest |

On low-memory machines, run tests with `npx vitest run --maxWorkers=2`.

### Environment variables

| Variable | Default | Effect |
|---|---|---|
| `VITE_API_BASE_URL` | empty | Empty runs the app in mock mode. A URL (for example `https://api.example.com/v1`) switches to HTTP mode. |

Put it in `.env.local`.

---

## 3. Tech stack

| Concern | Library | Notes |
|---|---|---|
| UI | React 19.3 | Function components, named exports only |
| Routing | React Router 8 | Data mode, lazy routes, root loader; imported from `react-router` |
| Language | TypeScript 6 | `strict`, no `any` |
| Build | Vite 8 | `vite-imagetools` for responsive images |
| Styling | Tailwind CSS v4 | CSS-first tokens in `src/design-system/tokens/index.css` |
| Motion | framer-motion 14 | `LazyMotion strict`, `m.*` components only |
| 3D | three + React Three Fiber 9 + drei 10 | Lazy-loaded, capability-gated |
| Charts | Recharts 3 | Colors from CSS variables |
| Icons | lucide-react | |
| Forms | react-hook-form + Zod 4 + @hookform/resolvers | Same Zod schema validates form and service |
| Dates | date-fns 4 | |
| State | zustand 5 | `persist` middleware for inventory and UI preferences |
| Overlays | Radix (dialog, popover, dropdown, tooltip) | |
| Command palette | cmdk | |
| Testing | Vitest 5 + Testing Library + jsdom | |

---

## 4. Project structure

```
src/
  app/              App shell
    errors/           NotFound, RouteErrorBoundary
    header/           Header, Breadcrumbs, GlobalSearch, SearchPalette,
                      NotificationBell, ThemeMenu, UserMenu
    layouts/          RootLayout, AppShell, Sidebar, MobileTabBar,
                      BrandMark, AppLoading
    providers.tsx     MotionConfig, theme, tooltip and toast providers
    registry.ts       List of modules; drives nav, routes, tabs
    router.tsx        Router built from the registry
  design-system/
    tokens/           CSS variables and Tailwind @theme
    primitives/       Button, Badge, Card, DataTable, Dialog, Sheet, Toast…
    motion/           Motion tokens, variants, Stagger, InView, Tilt,
                      Magnetic, CountUp, PageTransition, useFlash
    Gallery.tsx       Living style guide of every primitive
  three/            Hero3D, Accent3D, capability gate, static fallbacks
  data/
    types.ts          Domain types and enums
    api/              Client, endpoints, contracts, loader, sync, mock/
    store/            inventoryStore, uiStore, sessionStore, Zod schema
    selectors/        Pure read functions (stock, expiry, kpis, charts,
                      notifications, reports, transactions)
    services/         Pure write functions (medicines, stock, settings),
                      Zod schemas, invariants, Result type
    hooks.ts          useInventory, useInventoryActions, useCategories…
    actions.ts        Action bindings with server sync
    testing/          Fixtures for tests
  modules/          One folder per feature (see §7)
  shared/           Formatting, CSV, routes/links, labels, table helpers,
                    hooks (useToday, useUrlState, useTheme,
                    useReducedMotion, useDebouncedValue)
  assets/images/    Committed source photos, manifest, ResponsiveImage
docs/               REQUIREMENTS, FRONTEND_PLAN, ADDING_A_MODULE,
                    IMAGE_CREDITS, DOCUMENTATION
integration.md      Backend API contract
```

### Module folder layout

```
src/modules/<id>/
  components/       Module-private components
  hooks/            Module-private hooks
  lib/              Module-private pure helpers
  pages/            Route components
  schemas/          Zod schemas for URL params and forms
  routes.tsx        RouteObject[] with lazy pages and handles
  module.config.ts  ModuleConfig (id, label, icon, path, nav metadata)
  index.ts          Public API — the only file other modules may import
```

---

## 5. Architecture

### 5.1 Module registry

Every feature is a module that exports a `ModuleConfig`:

| Field | Meaning |
|---|---|
| `id` | Unique `ModuleId` |
| `label` | Name in sidebar, palette and tab bar |
| `icon` | lucide icon |
| `path` | Base URL |
| `routes` | `RouteObject[]`, lazy-loaded |
| `navOrder` | Sidebar position, or `null` to hide from navigation |
| `layout` | `'shell'` (sidebar + header) or `'bare'` (full screen) |
| `mobileTab` | `true` to appear in the bottom tab bar; otherwise under "More" |
| `breadcrumb` | Crumb text |

`src/app/registry.ts` lists the modules. The router, sidebar, mobile tab bar, "More" sheet, breadcrumbs, page titles and the command palette's "Go to" group are generated from it.

| Module | Path | Nav order | Layout | Mobile tab |
|---|---|---|---|---|
| Welcome | `/welcome` | — | bare | no |
| Dashboard | `/dashboard` | 1 | shell | yes |
| Medicines | `/medicines` | 2 | shell | yes |
| Stock Management | `/stock` | 3 | shell | yes |
| Expiry Management | `/expiry` | 4 | shell | yes |
| Low Stock | `/low-stock` | 5 | shell | More |
| Transactions | `/transactions` | 6 | shell | More |
| Reports | `/reports` | 7 | shell | More |
| Settings | `/settings` | 8 | shell | More |

### 5.2 Module boundaries

Modules may import only from:

- `@/design-system`
- `@/three`
- `@/data`
- `@/shared`
- another module's public `@/modules/<id>` index (for example the stock dialogs from `@/modules/stock`)

They never import `@/app/*` or another module's internals. ESLint enforces this.

### 5.3 Data flow

```
          ┌──────────── loadAppData() (root route loader) ────────────┐
          │  GET /me, /reference-data, /settings, /medicines,         │
          │      /batches, /transactions   (mock JSON or HTTP)        │
          └───────────────────────────┬───────────────────────────────┘
                                      ▼
                        inventoryStore (zustand, persisted)
                         ▲                         │
     services (pure,     │                         │  selectors (pure,
     Zod-validated,      │                         │  memoised, take today)
     return Result)      │                         ▼
          ▲              │             useInventory((state, today) => …)
          │                                        │
   useInventoryActions() ◄──── components ◄────────┘
          │
          └──► syncMutation() → server (HTTP mode only)
```

- **Reads** go through pure selectors: `useInventory((state, today) => selectX(state, today))`.
- **Writes** go through pure services via `useInventoryActions()`. Each service validates its input with the same Zod schema the form uses, updates the batch, appends exactly one immutable transaction, and returns `Result<T>` — either `{ ok: true, value }` or `{ ok: false, error: DomainError }`.
- In development an **invariant check** runs after every change: no negative stock; each batch's opening quantity plus its transactions equals its quantity; every reference points to an existing record.

Components never compute stock or expiry inline, so the dashboard, alerts, notification count and reports always agree.

### 5.4 "Today"

`useToday()` returns the start of the current local day and re-renders at local midnight. Selectors receive `today` as an argument and never call `new Date()`, which keeps them deterministic and easy to test.

### 5.5 Stores

| Store | Key in `localStorage` | Contents |
|---|---|---|
| `inventoryStore` | `medistock:inventory` (v2, mock mode only) | medicines, batches, transactions, settings, reference data |
| `uiStore` | `medistock:ui` (v3) | `sidebarCollapsed`, `hasSeenWelcome`, `theme`, `motion`; plus transient `commandOpen` |
| `sessionStore` | — | Current user from `/me` |

---

## 6. Application shell and navigation

### Layout

- **Sidebar** (desktop, ≥ 1024px): all shell modules in `navOrder`. Collapsible to an icon rail; the state persists in `uiStore.sidebarCollapsed`. Active item uses the `primary` accent.
- **Header**: page title and breadcrumbs, global search, theme menu, notification bell, user avatar menu. Uses the `glass` surface.
- **Mobile tab bar** (below 1024px): Dashboard, Medicines, Stock, Expiry, plus a **More** sheet with the remaining modules.
- **Page transitions**: content animates between routes with `PageTransition`.

### Breadcrumbs and titles

Each route has a `handle: { title, crumb }`. The title appears in the header and the browser tab. A crumb can be a component that receives route params — the medicine detail crumb shows the medicine's name, and the report crumb shows the report name.

### Global search (⌘K / Ctrl+K)

The command palette searches medicines by name, generic name, category and manufacturer, and shows each one's usable quantity (and "inactive" when relevant). Selecting a medicine opens its detail page. A **Go to** group lists every navigation item.

### Notification bell

Shows a badge with the number of open alerts (capped at "99+"). The popover lists alerts, each with an icon, label and link:

| Kind | Icon | Tone |
|---|---|---|
| Expires today | Alarm clock | urgent |
| Expired | Circle X | danger |
| Low stock | Trending down | warning |
| Expiring soon | Clock | warning |

When there are no alerts it shows "All clear".

### Theme and user menus

The theme menu switches Light / Dark / Auto. The user menu shows the current user (initials avatar, name, role, email).

### URL structure

All URLs are built with `links.*` from `@/shared/routes`:

| Link | URL |
|---|---|
| `links.welcome()` | `/welcome` |
| `links.dashboard()` | `/dashboard` |
| `links.medicines({ q, category, status })` | `/medicines?…` |
| `links.newMedicine()` | `/medicines/new` |
| `links.medicine(id, { tab })` | `/medicines/:id?tab=transactions` |
| `links.editMedicine(id)` | `/medicines/:id/edit` |
| `links.stock({ q, medicine, status })` | `/stock?…` |
| `links.expiry({ status, q })` | `/expiry?status=expiring-soon` |
| `links.lowStock({ q, category })` | `/low-stock?…` |
| `links.transactions({ q, type })` | `/transactions?…` |
| `links.report(id)` | `/reports/:reportId` |
| `links.settings()` | `/settings` |

List state — search, filters, sort and page — lives in URL search params (`useUrlState`, `useDataTableState`), so every view is shareable and survives reload and back/forward.

---

## 7. Screens

### 7.1 Welcome (`/welcome`)

A full-screen, bare-layout landing page.

- Pharmacy name, headline "Every batch, accounted for." and a short description.
- **KPI chips** with live figures from the inventory.
- **3D hero scene** (floating capsules) with a static image fallback on low-power devices, reduced motion or without WebGL2.
- **Enter dashboard** (magnetic primary button) marks the welcome as seen and opens the dashboard.
- **View expiry alerts** opens Expiry filtered to "Expiring soon".
- A feature strip summarising the modules, and a footer.

After the first visit, `/` redirects to the dashboard.

### 7.2 Dashboard (`/dashboard`)

A responsive bento grid (1 / 6 / 12 columns) that animates in with a stagger.

1. **Hero tile** — pharmacy name with a summary of the inventory and the alert window.
2. **KPI cards** — each is a link to the filtered detail page and counts up on change:

   | Card | Value | Sub-label | Opens | Tone |
   |---|---|---|---|---|
   | Total medicines | Active medicines | "active, of N total" | Medicines (active) | primary |
   | Usable units | Usable units | "worth ₹…" | Stock | primary |
   | Low stock | Low-stock count | "below minimum level" | Low Stock | warning when > 0 |
   | Expiring soon | Expiring soon + today | "incl. N today" or "within N days" | Expiry (expiring soon) | urgent if any today, else warning |
   | Expired batches | Expired batches | "N units" | Expiry (expired) | danger when > 0 |

3. **Category distribution** — donut chart of medicines by category (green ramp + neutrals) with legend.
4. **Monthly stock additions** — bar chart of units added per month.
5. **Low-stock table** — the medicines most below their minimum.
6. **Upcoming expiries table** — batches expiring soonest.

All figures come from selectors, so they update the moment stock changes.

### 7.3 Medicines (`/medicines`)

**List**

- Table columns: name and generic name, category, unit price, usable stock, minimum, next expiry, status. Low-priority columns hide below 1280px; below 1024px rows render as cards.
- Search by name or generic name; filter by category and status (Active / Inactive / All); sortable columns; pagination.
- Empty states for "no medicines yet" (with **Add medicine**) and "no matches" (with **Clear filters**).
- **Add medicine** opens a side sheet at `/medicines/new`.

**Medicine form (sheet)**

| Field | Rules |
|---|---|
| Name | 2–80 characters |
| Generic name | 2–80 characters; name + generic must be unique |
| Category | One of the reference-data categories |
| Manufacturer | 2–80 characters |
| Unit price (₹) | > 0, ≤ 100,000, max 2 decimals |
| Minimum stock level | Integer 0–100,000 |
| Description | Optional, ≤ 500 characters |
| Active | Toggle |

**Detail** (`/medicines/:id`)

- Header with category badge, Active/Inactive badge, Low-stock badge, generic name and manufacturer.
- Actions: **Edit** (sheet at `/medicines/:id/edit`), **Add batch** (disabled with a reason when inactive), **Activate/Deactivate** (with an **Undo** toast), **Delete** (only when the medicine has no batches and no transactions; otherwise disabled with "Has stock history — deactivate instead"; confirmed with a danger dialog).
- Stats: usable, expiring, expired and total units.
- Facts: unit price, minimum stock, manufacturer, last updated, description.
- Tabs (state in `?tab=`): **Batches** and **Transactions**, each with a count.

### 7.4 Stock Management (`/stock`)

Every batch on hand, soonest expiry first.

- Columns: batch number, medicine, received date, expiry date, quantity, expiry status badge, actions.
- Filters: medicine, expiry status, **Show empty** toggle (shows how many empty batches are hidden), **Clear filters**.
- Page actions: **Adjust stock**, **Receive stock**, **Add batch**.
- Row actions: Receive, Adjust, History.
- Rows changed by an action briefly flash to confirm the update.

**Add batch dialog**

| Field | Rules |
|---|---|
| Medicine | Active medicines only |
| Batch number | 2–30 chars, `A–Z 0–9 -`, stored uppercase, unique per medicine |
| Quantity | 1–100,000 |
| Received date | Not in the future |
| Expiry date | After today and after the received date |
| Remarks | Optional |

Creates a `BATCH_CREATED` transaction.

**Receive stock dialog** — choose a batch (pre-selected when opened from a row), quantity 1–100,000, date (not in the future, not before the batch was received), optional remarks. Not allowed on expired batches. Creates `STOCK_IN`.

**Adjust stock dialog** — direction Increase / Decrease, quantity, reason (Damaged, Expired – disposed, Count correction, Returned, Other), remarks (required, ≥ 3 characters, when the reason is Other). A decrease cannot exceed the batch quantity; expired batches can only be decreased. Creates `ADJUSTMENT_INCREASE` or `ADJUSTMENT_DECREASE`.

**Batch history sheet** — the batch's opening balance as the first row, then every transaction with signed change and quantity after, plus shortcuts to Receive and Adjust.

### 7.5 Expiry Management (`/expiry`)

- **Alert window** link in the header (for example "Alert window: 30 days") opens Settings.
- **Summary cards** for Expires Today, Expiring Soon, Expired and Valid; clicking one filters the table.
- **Segmented control**: All, Expires Today, Expiring Soon, Expired, Valid — each with a count.
- With Expiring Soon selected, an explanation ("1–N days left") and an **Include expiring today** toggle.
- Filters: category; **Show empty batches** toggle.
- Columns: medicine, batch, expiry date, days left, quantity, status badge, action.
- Row action on expired batches: **Write off**, which opens Adjust stock pre-set to Decrease with reason "Expired – disposed".
- Default sort: expiry date ascending.

### 7.6 Low Stock (`/low-stock`)

Active medicines whose usable stock is below their minimum. Expired stock does not count.

- Columns: medicine, category, usable units, minimum, shortfall, severity badge, actions.
- Default sort: shortfall descending. Search and category filter.
- Row actions: **Receive stock** and **Add batch** (opens the stock dialogs pre-filled with the medicine).
- Empty state "Everything is stocked above minimum."

### 7.7 Transactions (`/transactions`)

An immutable log. Entries cannot be edited or deleted.

- Columns: date and time, medicine, batch, type badge, signed quantity change, quantity after, reason / remarks.
- Search medicine, batch or remarks; filter by type and a from–to date range.
- Default sort: date descending.

| Type | Meaning | Sign |
|---|---|---|
| `BATCH_CREATED` | New batch with initial quantity | + |
| `STOCK_IN` | Delivery received into an existing batch | + |
| `ADJUSTMENT_INCREASE` | Manual correction upwards | + |
| `ADJUSTMENT_DECREASE` | Damage, disposal, return or correction | − |

### 7.8 Reports (`/reports/:reportId`)

Tabs switch between six reports. Each has its own search, filters, sortable table, row count and **Export CSV** button. The export contains exactly the visible (filtered and sorted) rows and is named after the report and date. Unknown report ids show a "report not found" state.

| Report | Id | Content | Filters |
|---|---|---|---|
| Medicine catalogue | `catalogue` | Every medicine with price, minimum level and usable stock | Category, Status |
| Usable stock | `usable-stock` | Medicines with usable stock, valued at unit price; expired excluded | Category |
| Low stock | `low-stock` | Active medicines at or below minimum | Category |
| Expiring soon | `expiring-soon` | Batches expiring today or within the alert window | Status |
| Expired | `expired` | Expired batches that still hold stock | Medicine |
| Transactions | `transactions` | Every stock movement, newest first | Type, Reason |

### 7.9 Settings (`/settings`)

| Card | Controls |
|---|---|
| Pharmacy | Display name (2–60 characters) |
| Alerts | Expiry alert window in days (1–365, default 30) |
| Currency | Indian Rupee (INR), fixed |
| Appearance | Segmented Light / Dark / Auto |
| Motion | On / Off (default On); overrides the OS reduced-motion preference |
| Demo data | **Reset demo data** with confirmation — mock mode only |

Resetting reloads the fixtures dated relative to today. Theme, motion and sidebar preferences are kept because they live in `medistock:ui`.

### 7.10 Errors

- Unknown URLs show a **Not found** page.
- Every route has an error boundary that shows a recoverable error screen.
- If loaded data fails the integrity check, the app shows an error screen instead of rendering inconsistent figures.

---

## 8. Business rules

### Expiry status (per batch)

Calculated against today in whole days:

| Days left | Status | Badge tone |
|---|---|---|
| below 0 | Expired | danger |
| exactly 0 | Expires Today (still usable) | urgent |
| 1 to the alert window | Expiring Soon | warning |
| more than the alert window | Valid | success |

The alert window is `settings.expiryAlertDays` (default 30).

### Stock

- **Usable stock** = sum of quantities of all non-expired batches. Expired quantity is shown separately and never counted as usable.
- **Low stock** = an *active* medicine whose usable stock is below its minimum level. Inactive medicines are excluded from alerts.
- **No negative stock** — enforced in forms, services and the invariant check.
- **Adjustments** need a reason; "Other" also needs remarks. Expired batches can only be adjusted downward.
- **Opening balances** — batches that predate the history carry an `openingQuantity`, shown as the first history row.
- **Deleting medicines** — allowed only without batches and transactions; otherwise deactivate.
- **Inactive medicines** cannot receive new batches.
- **Transactions are immutable.**

### Domain errors

| Code | When |
|---|---|
| `VALIDATION` | Input fails validation; `field` names the input |
| `NOT_FOUND` | Unknown medicine or batch |
| `NEGATIVE_STOCK` | A decrease would take a batch below 0 |
| `BATCH_EXPIRED` | Receiving into, or increasing, an expired batch |
| `DUPLICATE_BATCH` | Batch number already exists for the medicine |
| `DUPLICATE_MEDICINE` | Same name + generic name already exists |
| `MEDICINE_INACTIVE` | Adding a batch to an inactive medicine |
| `MEDICINE_HAS_HISTORY` | Deleting a medicine with batches or transactions |
| `NETWORK` | Server unreachable (client-generated) |
| `INVALID_RESPONSE` | Response does not match the schema (client-generated) |

---

## 9. Data layer

### Entities

| Entity | Key fields |
|---|---|
| `Medicine` | `id`, `name`, `genericName`, `category`, `manufacturer`, `unitPrice`, `minStockLevel`, `description`, `isActive`, `createdAt`, `updatedAt` |
| `Batch` | `id`, `medicineId`, `batchNumber`, `openingQuantity`, `quantity`, `receivedDate`, `expiryDate`, `createdAt` |
| `StockTransaction` | `id`, `medicineId`, `batchId`, `type`, `quantityChange` (signed), `quantityAfter`, `date`, `reason?`, `remarks?` |
| `Settings` | `pharmacyName`, `currency` (`INR`), `expiryAlertDays` |
| `ReferenceData` | `categories: { name }[]` |
| `CurrentUser` | `id`, `name`, `role`, `email` |

### Selectors (`src/data/selectors`)

| File | Provides |
|---|---|
| `stock.ts` | Medicine and batch views with stock summaries (usable, expiring, expired, next expiry) |
| `expiry.ts` | Expiry status and days left per batch |
| `kpis.ts` | Dashboard KPIs |
| `charts.ts` | Category distribution and monthly additions |
| `notifications.ts` | Bell alerts and count |
| `reports.ts` | Columns and rows for each report |
| `transactions.ts` | Transaction views joined with medicine and batch |
| `memo.ts` | Memoisation helpers keyed on state and day |

### Services (`src/data/services`)

| File | Provides |
|---|---|
| `medicines.ts` | Create, update, set active, delete |
| `stock.ts` | Add batch, receive stock, adjust stock |
| `settings.ts` | Update settings |
| `schemas.ts` | Zod schemas shared by forms and services |
| `invariants.ts` | `assertInvariants` integrity check |
| `result.ts` | `Result<T>` and `DomainError` |

### Hooks (`src/data/hooks.ts`)

- `useInventory(selector)` — subscribe to a selector; the selector receives `(state, today)`.
- `useInventoryActions()` — bound service calls that also sync to the server in HTTP mode.
- `useCategories()` — category names from reference data.

### Demo data

`src/data/api/mock/*.json` (one file per endpoint): 25 medicines in 8 categories (4 inactive), 38 batches and 30 transactions. Dates are written for `mock/meta.json → referenceDate` and shifted to today on load, so the demo always contains valid, expiring-soon, expiring-today and expired batches and several low-stock medicines.

---

## 10. Backend integration

The full contract is in [`integration.md`](../integration.md). Summary:

- Responses are wrapped in `{ "data": … }`; errors in `{ "error": { code, message, field? } }`.
- IDs are generated on the client (`<prefix>_<uuid>`); the server must keep them, which makes retries idempotent.
- Requests use `credentials: 'include'` (cookie auth). Cross-origin servers must allow CORS with credentials.

| Method | Path | Purpose |
|---|---|---|
| GET | `/me` | Current user |
| GET | `/reference-data` | Categories |
| GET | `/settings` | Settings |
| GET | `/medicines` | All medicines |
| GET | `/batches` | All batches |
| GET | `/transactions` | All transactions |
| POST | `/medicines` | Create medicine |
| PUT | `/medicines/:id` | Update medicine |
| PATCH | `/medicines/:id` | Set `isActive` |
| DELETE | `/medicines/:id` | Delete medicine |
| POST | `/batches` | Create batch (`BATCH_CREATED`) |
| POST | `/batches/:batchId/receipts` | Receive stock (`STOCK_IN`) |
| POST | `/batches/:batchId/adjustments` | Adjust stock |
| PATCH | `/settings` | Update settings |
| POST | `/demo/reset` | Optional demo reset |

**Write flow:** the service validates and updates the store optimistically → `syncMutation` sends the request → on success the server's entity replaces the local copy; on failure a "Change not saved" toast shows the server message and all data reloads.

---

## 11. Design system

### Visual direction

Minimal: a warm off-white canvas, near-black ink, hairline borders and **one** muted deep-green accent used sparingly — primary buttons, active navigation, focus rings and key chart marks. Status colors appear only in small badges, always with an icon and a text label. Borders are preferred over shadows; there are no decorative gradients on UI chrome.

### Color tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | `#FFFFFF` | `#111111` | Page background |
| `bg-subtle` | `#FAFAF8` | `#0B0B0B` | Canvas |
| `surface` | `#FFFFFF` | `#161616` | Cards |
| `surface-muted` | `#F4F4F2` | `#1F1F1E` | Hover, wells |
| `border-subtle` | `#ECEBE8` | `#2A2927` | Hairlines |
| `border-strong` | `#D6D3CE` | `#3D3B38` | Inputs, hover borders |
| `fg` | `#161616` | `#F5F5F4` | Text |
| `fg-muted` | `#57534E` | `#B8B3AD` | Secondary text |
| `fg-faint` | `#78716C` | `#8F8A84` | Tertiary text |
| `primary` | `#1F6B4F` | `#5FAE8B` | Accent |
| `success` | `#2F6F4E` | `#6FB892` | Valid |
| `warning` | `#92600A` | `#D9A441` | Expiring soon, low stock |
| `urgent` | `#A8481F` | `#E08A5F` | Expires today |
| `danger` | `#B42318` | `#F07A70` | Expired, destructive |
| `info` | `#3F5F7A` | `#8FB0CC` | Informational |
| `chart-1…8` | green ramp, stone neutrals, amber | adjusted for dark | Charts |

Each status color has a `-soft` background variant. Components use semantic utilities only (`bg-surface`, `text-fg-muted`, `border-border-subtle`, `bg-warning-soft`…); raw hex and palette classes such as `slate-*` are not allowed in modules.

### Typography

SF Pro / Inter Variable.

| Token | Size / line height |
|---|---|
| `text-xs` | 12 / 16 |
| `text-sm` | 14 / 20 |
| `text-base` | 16 / 24 |
| `text-lg` | 20 / 28 |
| `text-xl` | 24 / 32 |
| `text-2xl` | 32 |
| `text-display` | 48, tight tracking |

Every number uses tabular figures (`tabular` utility).

### Shape and spacing

- Radii: `rounded-sm` 8, `rounded-md` 12, `rounded-lg` 16, `rounded-xl` 20 px.
- Shadows: `shadow-xs`, `shadow-card`, `shadow-raised`.
- 8-point spacing grid.
- Utilities: `card`, `glass` (header, sidebar, dialogs, hero only), `skeleton`, `tabular`, `focus-ring`.

### Primitives (`@/design-system`)

| Primitive | Purpose |
|---|---|
| `Avatar` | Initials avatar |
| `Badge`, `ExpiryBadge`, `TransactionTypeBadge` | Status labels with icon and text |
| `Button` | Variants primary / secondary / subtle / ghost / danger; sizes; leading/trailing icons; loading |
| `Card`, `Section` | Surfaces with title, description and actions |
| `CommandPalette` | cmdk palette |
| `ConfirmDialog` | Confirmation with neutral or danger tone |
| `DataTable`, `DataTableView` | Search, filters, sort, pagination, URL state, mobile cards, row flash, empty state |
| `Dialog`, `Sheet` | Modal and side sheet (Radix) |
| `Dropdown`, `Popover`, `Tooltip` | Radix overlays |
| `EmptyState` | Icon, title, description, action |
| `Field`, `Input`, `DateInput`, `Select`, `SearchInput` | Form controls with labels and errors |
| `Kbd` | Keyboard hint |
| `PageHeader` | Title, eyebrow, description, actions |
| `Pagination` | Page controls |
| `ProgressBar`, `Skeleton`, `Spinner` | Progress and loading |
| `StatCard` | KPI card with count-up, tone and link |
| `Tabs`, `SegmentedControl`, `ThemeSegmentedControl` | Tabs and segmented choices |
| `Toast` | `toast.success/info/error` with optional action (e.g. Undo) |

A living style guide of every primitive is in `src/design-system/Gallery.tsx`.

#### DataTable

- Columns declare `id`, header, cell, sort accessor and `hideBelowXl` for low-priority columns.
- Below 1024px each row renders with `mobileCard`.
- `rowHref` makes whole rows links.
- `flashIds` highlights rows just changed.
- State (`q`, `sort`, `dir`, `page`) is kept in the URL; `defaultState` sets the initial sort.

### Motion helpers (`@/design-system/motion`)

| Helper | Purpose |
|---|---|
| `tokens.ts` | Spring presets `snappy`, `smooth`, `gentle` and durations |
| `variants.ts` | Shared enter/exit variants |
| `PageTransition` | Route transitions |
| `Stagger`, `StaggerItem` | Staggered entrances (dashboard) |
| `InView` | Reveal on scroll |
| `CountUp` | Animated numbers |
| `Tilt` | Subtle 3D tilt on fine pointers |
| `Magnetic` | Magnetic hover for hero CTA |
| `useFlash` | Row highlight after change |
| `useFinePointer` | Detect mouse vs touch |

### 3D (`@/three`)

| Component | Purpose |
|---|---|
| `Hero3D` / `HeroCanvas` / `WelcomeScene` | Welcome scene with floating capsules |
| `Accent3D` / `AccentCanvas` / `CapsuleAccent` | Small accent scenes |
| `Lazy3DFrame`, `CanvasShell` | Lazy loading and canvas setup |
| `useCanRender3D` | Capability gate: WebGL2, memory, cores, motion, data saver |
| `StaticHeroFallback`, `StaticAccentFallback` | Static renders |
| `FallbackBoundary` | Falls back if WebGL fails |

---

## 12. Theming and motion

### Themes

- **Light**, **Dark** and **Auto** (follows the OS).
- `useTheme()` from `@/shared/hooks` returns `{ preference, resolved, setTheme }`.
- The resolved theme is set as `data-theme` on `<html>` before first paint (no flash).
- Changed from the header theme menu or Settings → Appearance; stored in `medistock:ui`.
- Charts read colors from CSS variables (`var(--chart-1)`, `var(--fg-muted)`, `var(--border-subtle)`), so they switch with the theme.

### Motion

- The app runs under `<LazyMotion strict>`; components use `m.*`.
- **Settings → Motion** (On/Off, default On) is stored in `uiStore.motion`, mirrored to `data-motion` on `<html>`, and drives `MotionConfig`. It overrides the OS reduced-motion preference.
- Code gates motion with `useReducedMotion` from `@/shared/hooks`, and CSS uses `motion-safe:` / `motion-reduce:` variants keyed off `data-motion`.
- Count-up, tilt, magnetic and 3D are disabled when motion is off.
- Animations are short and subtle: page transitions, staggered card entrances, hover/press feedback, overlay and toast transitions, chart entrances, sidebar collapse.

---

## 13. Responsive behaviour

| Width | Navigation | Tables | Layout |
|---|---|---|---|
| ≥ 1280px | Full sidebar | All columns | 12-column dashboard |
| 1024–1279px | Collapsible sidebar | `hideBelowXl` columns hidden | Adapted grid |
| < 1024px | Bottom tab bar + More sheet | Card layout (`mobileCard`) | 6 / 1 columns, stacked cards |

- No horizontal page scroll from 360px up.
- Touch targets are at least 44px on touch devices.
- Dialogs and sheets are full-height and touch-friendly on mobile.
- Scrollbars auto-hide and appear on hover or scroll.

---

## 14. Accessibility

- Status is never shown by color alone: every badge has an icon and a text label.
- Every interactive element has hover, active (`scale 0.97`), visible focus ring, disabled and loading states.
- Radix provides focus trapping, Escape to close and ARIA roles for dialogs, popovers, menus and tooltips.
- Tables have captions; sortable headers expose sort state.
- Icon-only buttons have `aria-label`s; the bell announces its alert count.
- Disabled actions explain why (for example "Activate this medicine to add stock").
- Linted with `eslint-plugin-jsx-a11y`.

---

## 15. Performance

- Routes are lazy-loaded; each module is its own chunk.
- framer-motion loads its features asynchronously through `LazyMotion`.
- three.js and Recharts load in separate lazy chunks.
- 3D renders only on capable devices (WebGL2, at least 4 GB memory and 4 cores when the browser reports them) and pauses when off-screen or when the tab is hidden.
- A sustained low frame rate first drops the scene to 1× pixel ratio, then falls back to the static render. A lost WebGL context shows the static render and rebuilds the scene, up to two times.
- Images ship as AVIF/WebP `srcset`s with explicit dimensions and a blur-up placeholder.
- Selectors are memoised per state and day.
- Mock fixtures are fetched as separate chunks on demand.

---

## 16. Testing and quality gates

- **Unit tests**: selectors, services, invariants, store migrations, API client, table helpers, theme hook — all with a fixed `today`.
- **Component tests**: page-level tests for Dashboard, Stock, Expiry, Low Stock, Transactions and Welcome with Testing Library.
- Fixtures: `src/data/testing/`.

Before every commit, all four must pass:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

---

## 17. Extending the app

See [`ADDING_A_MODULE.md`](ADDING_A_MODULE.md). In short:

1. Create `src/modules/<id>/` with `pages/`, `routes.tsx`, `module.config.ts` and `index.ts`.
2. Add the id to the `ModuleId` union in `src/shared/module.ts`.
3. Add the module to `src/app/registry.ts`. Navigation, routes, breadcrumbs and titles follow automatically.
4. For new data: add types and schema, bump the persisted store version with a migration, add selectors and services with tests, add the endpoint and a mock fixture, and document it in `integration.md`.

---

## 18. Conventions and rules

- No comments in source; explanations go in docs and commit messages.
- Named exports only; no `any`; small single-purpose components.
- Business logic only in `src/data/selectors` and `src/data/services`.
- Money with `formatINR`, dates with `formatDate` (`dd MMM yyyy`), numbers with `tabular`.
- URLs with `links.*`; list state in the URL.
- Semantic color tokens only; every screen checked in both themes.
- Motion with `m.*` and the in-app motion setting.
- Commit subjects ≤ 6 words, bodies ≤ 15 words.

---

## 19. Reference

### Glossary

| Term | Meaning |
|---|---|
| Batch | A lot of one medicine with its own number, quantity and expiry date |
| Usable stock | Units in batches that have not expired |
| Alert window | Days before expiry when a batch becomes "Expiring Soon" |
| Shortfall | Minimum level minus usable stock |
| Opening quantity | Stock a batch held before its recorded history |
| Write-off | A decrease adjustment with reason "Expired – disposed" |

### Related documents

| Document | Contents |
|---|---|
| `README.md` | Quick start and overview |
| `integration.md` | Backend API contract |
| `docs/REQUIREMENTS.md` | Original requirements (source of truth) |
| `docs/FRONTEND_PLAN.md` | Approved frontend plan |
| `docs/ADDING_A_MODULE.md` | Module walkthrough |
| `docs/IMAGE_CREDITS.md` | Photo credits |
