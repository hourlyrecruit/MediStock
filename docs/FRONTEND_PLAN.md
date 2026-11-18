# MediStock — Frontend Plan

Status: **Revision 2 — draft for approval.** No feature code is written until this plan is approved.

**Changes in revision 2** (from your answers):
- Expiry gains a fourth status, **Expires Today** (`daysLeft = 0`).
- **Latest stack:** React 19.3, React Router 8 and React Three Fiber 9, with version pins in §9.
- Adjustment remarks, transaction counts and deletes are now final decisions (§0.6), not open questions.
- TypeScript (strict) is confirmed.

Sources: `MediStock Frontend Project Requirements.docx` (the requirements doc, which wins any conflict) and `prompt.md` (the design, architecture and quality standard).

---

## 0. Discovery summary

### 0.1 What MediStock is
MediStock is a frontend-only inventory app for a small pharmacy or clinic. It tracks medicines, the batches each medicine is stocked in, and an immutable log of every stock movement. From that data it derives usable stock, expiry status, low-stock alerts, charts and CSV reports. All data is fictional seed data held in localStorage. Reset Demo Data restores the seed.

### 0.2 Modules
| Module | Owns |
|---|---|
| Welcome | 3D hero, pharmacy name, live KPI chips, and the entry CTA |
| Dashboard | KPI tiles, the category donut, monthly additions, and the low-stock and upcoming-expiry tables |
| Medicines | Medicine catalogue: create, view and edit; search, filter, sort and paginate; activate and deactivate |
| Stock | Batches: add a batch, receive stock, adjust stock, and per-batch history |
| Expiry | Every batch with days left and a status badge, filters, and sorting by expiry |
| Low Stock | Active medicines whose usable stock is below their minimum |
| Transactions | The read-only stock movement log |
| Reports | 6 reports, each searchable and filterable, with CSV export |
| Settings | Pharmacy name, INR display, the expiry threshold, and Reset Demo Data |

### 0.3 Entities
`Medicine`, `Batch`, `StockTransaction`, `Settings` (types in §3).

### 0.4 Business rules
- Expiry status is computed per batch, against today, at day granularity.
- Usable stock = the sum of non-expired batch quantities. Expired quantity is shown separately and never counted as usable.
- A medicine is low stock when its usable stock is below its `minStockLevel`.
- Stock can never go negative; this is enforced in the schema and again in the service.
- Every stock change updates its batch and appends exactly one immutable transaction.
- Every view derives from the same pure selectors, so a change anywhere updates every view.
- Money is shown in INR (`en-IN`); dates are shown as `dd MMM yyyy`.

### 0.5 Out of scope
Backend or database, real auth or user management, sales and billing, suppliers, purchase orders, payments, barcode scanning, AI features, email/SMS/WhatsApp notifications, multi-branch support, and patients/prescriptions.

### 0.6 Conflicts between `prompt.md` and the requirements doc (resolved)
| # | Conflict | Resolution |
|---|---|---|
| C1 | The doc says "Between **1** and 30 days → Expiring Soon" and leaves day 0 undefined. | **Decided by you:** day 0 gets its own status, **Expires Today**. Expiring Soon is exactly the doc's 1…threshold days. An Expires Today batch is **still usable** (its expiry date hasn't passed); it becomes Expired tomorrow. See §3.3 for the four statuses. |
| C2 | The doc stack says "React **JS**"; the prompt says TypeScript, React 18 and React Router v6. | **Decided by you:** TypeScript (strict) on the **latest stable versions**: React 19.3, React Router 8 and React Three Fiber 9. This replaces the prompt's React 18 / v6 pins. |
| C3 | The doc says transactions have *optional* remarks; the prompt says adjustments *require* a reason and remarks. | Remarks stay optional on the entity, which satisfies the doc. **Adjustments require a `reason`**: `Damaged`, `Expired – disposed`, `Count correction`, `Returned to stock` or `Other`. Remarks are **required when the reason is Other** and optional otherwise, capped at 200 characters. Stock In and Batch Created keep remarks optional. Every adjustment is explainable without forcing free text on routine ones. |
| C4 | The doc asks for 38 batches and 30 transactions. If every batch had a `BATCH_CREATED` transaction, there would be at least 38 transactions. | Batches have an **opening balance**: `openingQuantity`, which is the quantity on hand when tracking began. 22 older batches have only an opening balance; the other 16 batches were created inside the 6-month history window, so each has a `BATCH_CREATED` transaction. Together with 10 `STOCK_IN` and 4 adjustment transactions, that makes **exactly 30**. For every batch, `openingQuantity + Σ quantityChange = quantity`, and the batch history shows an "Opening balance" row first. Every number is traceable while meeting the doc's counts. |
| C5 | The prompt says "CRUD"; the doc lists add, view, edit and activate/deactivate, with no delete. | **Guarded delete.** A medicine can be deleted **only if it has no batches and no transactions** (for example, one created by mistake), after a ConfirmDialog. Otherwise Delete is disabled, with a tooltip saying to deactivate instead, so history is never orphaned. Batches and transactions are never deleted. Empty batches (qty 0) are hidden by default through a "Show empty batches" toggle. |
| C6 | The doc says "React state and localStorage"; the prompt adds zustand. | Use zustand `persist`. It is React state backed by localStorage. |
| C7 | The prompt names the file `MediStock_Frontend_Project_Requirements.docx`; the repo file has spaces in its name. | I'll export the doc to `docs/REQUIREMENTS.md` in P1 so it can be diffed. |

### 0.7 Remaining assumptions (I'll proceed with these unless you object)
1. **Git:** I'll run `git init` in P1 for the per-phase commits. Local only, with no remote.
2. **Mobile navigation:** a bottom tab bar (Dashboard, Medicines, Stock, Expiry, plus More).
3. **Images:** I'll download a curated set of free Unsplash/Pexels images. If a download fails, I'll use gradient/SVG placeholders.

### 0.8 Decisions that don't block the build
| Topic | Decision |
|---|---|
| Inactive medicines in Low Stock | **Excluded.** An inactive medicine is deliberately not restocked, so alerting on it is noise. The medicine detail page still shows its stock. |
| Inactive medicines in totals | KPI *Total medicines* counts **active** medicines and shows "of N" for the total. *Usable units* counts **all** physical non-expired stock. |
| Receive Stock target | Receives into an **existing, non-expired** batch (`STOCK_IN`). New stock under a new batch number uses **Add Batch** (`BATCH_CREATED`, with `quantityChange` = the opening quantity). |
| Expired batches | Receiving and increase adjustments are **blocked**. Decrease adjustments are **allowed**, so expired stock can be written off. |
| Add Batch validation | `batchNumber` must be unique per medicine, `receivedDate` ≤ today, `expiryDate` > today, and quantity is an integer from 1 to 100,000. |
| Alerts with zero quantity | Batches with `quantity = 0` are excluded from expiry alerts and the bell count. |
| Bell count | (active low-stock medicines) + (Expires Today batches with qty > 0) + (Expiring Soon batches with qty > 0) + (Expired batches with qty > 0). Expires Today items are listed first in the popover. |
| Expires Today in summaries | The **Expiring soon** KPI and the "Expiring-soon batches" report **include** Expires Today batches, each with its own badge, and the KPI shows "incl. N today". The Expiry page filter chips separate them: All / Expires Today / Expiring Soon / Expired / Valid. |
| Expiry threshold | An integer from 1 to 365. The default is 30. |
| "Today" | `useToday()` returns the start of today and re-renders at local midnight. Selectors receive `today` as an argument, never `new Date()`. |
| Date storage | ISO calendar dates (`yyyy-MM-dd`) for `expiryDate`/`receivedDate`; ISO timestamps for `createdAt`/`date`. |
| Theme | **Light / Dark / Auto (system)** ships now (your request). The preference is persisted in UI prefs (default Auto) and applied before first paint by an inline script, so there's no flash. Switch it from the header theme menu or the Settings segmented control. Auto follows `prefers-color-scheme` live. |
| Mock user | "Dr. Ananya Rao, Pharmacist". Local only, with a fake avatar menu (Profile and Sign out are disabled stubs). |

---

## 1. Sitemap, routes and navigation

### 1.1 Routes
All routes are lazy-loaded, and each one has its own error boundary. Route state that should survive a refresh or be shareable lives in the **URL search params**.

| Path | Module | Search params |
|---|---|---|
| `/` | — | Redirects to `/welcome` on the first visit, otherwise to `/dashboard` |
| `/welcome` | welcome | — (bare layout, no app shell) |
| `/dashboard` | dashboard | — |
| `/medicines` | medicines | `q`, `category`, `status=active\|inactive\|all`, `sort`, `dir`, `page`, `size` |
| `/medicines/new` | medicines | Opens the create sheet over the list |
| `/medicines/:id` | medicines | `tab=batches\|transactions` |
| `/medicines/:id/edit` | medicines | Opens the edit sheet over the detail page |
| `/stock` | stock | `q`, `medicine`, `status=valid\|expiring-soon\|expires-today\|expired`, `empty=show`, `sort`, `dir`, `page` |
| `/expiry` | expiry | `status=all\|expires-today\|expiring-soon\|expired\|valid` (default `all`), `q`, `category`, `sort=expiry`, `page` |
| `/low-stock` | low-stock | `q`, `category`, `sort`, `page` |
| `/transactions` | transactions | `q`, `type`, `from`, `to`, `sort`, `dir`, `page` |
| `/reports` | reports | Redirects to `/reports/catalogue` |
| `/reports/:reportId` | reports | `catalogue \| usable-stock \| low-stock \| expiring-soon \| expired \| transactions`, plus that report's filters |
| `/settings` | settings | — |
| `*` | app | 404 with an empty state and a link back to the dashboard |

The stock dialogs (Add Batch, Receive, Adjust) are **in-page dialogs**, not routes. They open from Stock, from Medicine detail and from the Low Stock rows.

### 1.2 Navigation model
- **Sidebar** (desktop ≥1280px): a full sidebar that collapses to a 72px icon rail; the collapsed state is persisted. On tablet (768–1279px) the icon rail is the default and expands as an overlay.
- **Mobile** (<768px): a top bar shows the title, search and bell. A bottom tab bar holds Dashboard, Medicines, Stock and Expiry, plus a **More** tab that opens a sheet with the remaining routes. Touch targets are at least 44px.
- **Header:** title and breadcrumbs (both generated from the registry), a ⌘K/Ctrl+K command palette for medicine search, the bell popover and the avatar menu.
- The logo always links back to `/welcome`.

### 1.3 Main user flows
1. **First run:** the user lands on Welcome, sees the 3D hero and live KPIs, and clicks Enter Dashboard. `hasSeenWelcome` is set, so the next visit goes straight to `/dashboard`.
2. **Investigate an alert:** clicking the bell or a KPI tile opens the target page with its filters already in the URL. From there the user reaches the medicine detail page and then a batch.
3. **Receive a delivery:** from Stock, Medicine detail or a Low Stock row, the user opens Add Batch (a new lot) or Receive Stock (an existing lot). The dialog previews "current → new". On confirm, the batch and transaction are written, the row flashes, a toast appears, and the KPIs, bell and charts all update.
4. **Write off expired stock:** from an Expiry row, the user opens Adjust with *Decrease* and reason *Expired – disposed* preset, then confirms. Expired qty drops, the transaction is logged, and alerts clear.
5. **Maintain the catalogue:** the user adds or edits a medicine in a sheet, or deactivates one. Deactivation shows a toast with **Undo**. A medicine with no batches and no transactions can be deleted after confirmation.
6. **Report:** the user picks a report, filters it, and exports CSV. The file contains exactly the rows shown, across all pages.
7. **Tune alerts:** the user changes the expiry threshold in Settings, and every status recomputes live.
8. **Reset:** the user clicks Reset Demo Data, confirms, and the seed is regenerated relative to today.

---

## 2. Module map

```
                         ┌──────────── app/ ─────────────┐
                         │ registry → routes, sidebar,   │
                         │ breadcrumbs; shell; providers │
                         └──────────────┬────────────────┘
                                        │ imports module.config only
 ┌──────────┬───────────┬───────────┬───┴──────┬────────────┬─────────┬──────────┬──────────┐
 welcome  dashboard  medicines     stock     expiry     low-stock  transactions reports  settings
    │          │          │           │         │           │           │          │        │
    └──────────┴──────────┴───────────┴────┬────┴───────────┴───────────┴──────────┴────────┘
                                           │ read: selectors   write: services
                                ┌──────────▼──────────┐
                                │ data/  store ◄── services (pure core + store binding)
                                │        selectors (pure, memoised per state+today+settings)
                                │        seed (generateSeed(today))
                                └─────────────────────┘
          design-system/ · motion/ · three/ · shared/  ← used by every module
```

**Ownership and communication rules**
- A module owns its pages, its module-specific components and its form schemas.
- **Modules never import each other's internals.** Cross-module UI goes through a module's public `index.ts`. For example, Stock's `index.ts` exports `<AddBatchDialog>`, `<ReceiveStockDialog>` and `<AdjustStockDialog>`, which Medicines, Low Stock and Expiry all reuse.
- **Every read** goes through `data/selectors`, using the `useInventory(selector)` hook.
- **Every write** goes through `data/services`. Services return `Result<T, DomainError>`, and the UI turns that into a toast or an inline form error.
- Navigation between modules uses typed link helpers in `shared/routes.ts` (for example `links.expiry({ status: 'expired' })`), so no URL strings are hard-coded.
- Dependency direction is enforced with ESLint `no-restricted-imports` patterns.

**Module registry contract**
```ts
interface ModuleConfig {
  id: ModuleId;
  label: string;
  icon: LucideIcon;
  path: string;
  routes: RouteObject[];
  navOrder: number | null;
  layout: 'shell' | 'bare';
  featureFlag?: FeatureFlag;
  breadcrumb: (match: UIMatch) => string;
  mobileTab?: boolean;
}
```
`app/registry.ts` is an ordered array of the module configs. `buildRouter(registry)`, `buildNav(registry)` and `useBreadcrumbs()` all derive from it.

---

## 3. Data model

### 3.1 Types
```ts
type ID = string;
type ISODate = string;
type ISODateTime = string;

type MedicineCategory =
  | 'Analgesics' | 'Antibiotics' | 'Antidiabetics' | 'Cardiovascular'
  | 'Antihistamines' | 'Gastrointestinal' | 'Vitamins & Supplements' | 'Respiratory';

interface Medicine {
  id: ID;
  name: string;
  genericName: string;
  category: MedicineCategory;
  manufacturer: string;
  unitPrice: number;
  minStockLevel: number;
  description: string;
  isActive: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

interface Batch {
  id: ID;
  medicineId: ID;
  batchNumber: string;
  openingQuantity: number;
  quantity: number;
  expiryDate: ISODate;
  receivedDate: ISODate;
  createdAt: ISODateTime;
}

type TransactionType =
  | 'STOCK_IN' | 'ADJUSTMENT_INCREASE' | 'ADJUSTMENT_DECREASE' | 'BATCH_CREATED';

type ExpiryStatus = 'EXPIRED' | 'EXPIRES_TODAY' | 'EXPIRING_SOON' | 'VALID';

type AdjustmentReason =
  | 'DAMAGED' | 'EXPIRED_DISPOSED' | 'COUNT_CORRECTION' | 'RETURNED' | 'OTHER';

interface StockTransaction {
  id: ID;
  medicineId: ID;
  batchId: ID;
  type: TransactionType;
  quantityChange: number;
  quantityAfter: number;
  date: ISODateTime;
  reason?: AdjustmentReason;
  remarks?: string;
}

interface Settings {
  pharmacyName: string;
  currency: 'INR';
  expiryAlertDays: number;
}

interface InventoryState {
  schemaVersion: 1;
  medicines: Record<ID, Medicine>;
  batches: Record<ID, Batch>;
  transactions: StockTransaction[];
  settings: Settings;
  seededOn: ISODate;
}

interface UiPrefs {
  sidebarCollapsed: boolean;
  hasSeenWelcome: boolean;
}
```
- `unitPrice` is stored in rupees as a number and formatted with `Intl.NumberFormat('en-IN', …)`.
- `quantityChange` is signed.
- `transactions` is append-only.
- `openingQuantity` is 0 for batches created through Add Batch, because their initial stock is the `BATCH_CREATED` transaction. The invariant is `openingQuantity + Σ quantityChange(batch) = quantity`, and `quantity ≥ 0` at every step.
- `UiPrefs` is persisted separately under its own key, so Reset Demo Data doesn't replay the welcome screen.

### 3.2 Persistence
- The store is zustand with `persist` → localStorage key `medistock:inventory`, plus `version` and a `migrate` function. The `medistock:ui` key holds `UiPrefs`.
- On first load, or when the stored data is unreadable or fails validation, the store hydrates from `generateSeed(today)`. The persisted state is validated against a Zod schema.
- **Reset Demo Data** opens a ConfirmDialog, then replaces the inventory with `generateSeed(today)`.

### 3.3 Derived selectors (pure; signature `(state, today) => …`)
| Selector | Returns |
|---|---|
| `daysUntilExpiry(batch, today)` | `differenceInCalendarDays(parseISO(expiryDate), today)` |
| `expiryStatus(daysLeft, alertDays)` | `< 0` → `EXPIRED`; `= 0` → `EXPIRES_TODAY`; `1…alertDays` → `EXPIRING_SOON`; `> alertDays` → `VALID` |
| `isUsable(status)` | `true` for every status except `EXPIRED` |
| `selectBatchViews` | Each batch joined with its medicine, plus `daysLeft` and `status` |
| `selectStockByMedicine` | `Record<ID, { usable, expiringToday, expired, total, batchCount, nextExpiry }>` |
| `selectBatchHistory(batchId)` | An opening-balance row (when > 0), then the batch's transactions with a running quantity |
| `selectMedicineViews` | Each medicine plus its stock summary and an `isLowStock` flag |
| `selectLowStock` | Active medicines where `usable < minStockLevel`, sorted by shortfall descending |
| `selectExpiresToday` / `selectExpiringSoon` / `selectExpired` | Batch views with `qty > 0` and the matching status, sorted by expiry ascending. `selectExpiringSoon({ includeToday: true })` feeds the KPI and the report. |
| `selectKpis` | `totalMedicines`, `activeMedicines`, `usableUnits`, `lowStockCount`, `expiresTodayCount`, `expiringSoonCount`, `expiredCount`, `expiredUnits`, `usableStockValue` |
| `canDeleteMedicine(id)` | `true` only when the medicine has no batches and no transactions |
| `selectCategoryDistribution` | `{ category, medicines, usableUnits }[]` |
| `selectMonthlyAdditions(months = 6)` | Units added per month (`STOCK_IN` + `BATCH_CREATED` + `ADJUSTMENT_INCREASE`), with zero-filled months |
| `selectTransactionViews` | Each transaction joined with its medicine name and batch number, newest first |
| `selectNotifications` | `{ kind, title, href }[]`; `count` = the bell rule in §0.8 |
| `selectReport(reportId)` | `{ columns, rows }`, used by both the table and the CSV export |

Memoisation is by reference on `(state slices, today, alertDays)` in a small helper in `shared/memo.ts`, so no reselect dependency is needed.

### 3.4 Services (pure core plus a store binding)
Each service is a pure function, `(state, input, now) => Result<InventoryState, DomainError>`, and `useInventoryActions()` binds it to the store.

| Service | Validation (Zod schema and service) | Effect |
|---|---|---|
| `createMedicine` | name 2–80 characters; genericName required; price > 0 with ≤ 2 decimal places; min stock is an integer ≥ 0; the name and generic name combination is unique | Adds the medicine |
| `updateMedicine` | Same rules | Updates the medicine and bumps `updatedAt` |
| `setMedicineActive` | — | Toggles `isActive` and returns the previous value so the UI can undo |
| `deleteMedicine` | `canDeleteMedicine` must be true; otherwise the service returns `MEDICINE_HAS_HISTORY` | Removes the medicine |
| `addBatch` | See §0.8 | Creates the batch and appends a `BATCH_CREATED` transaction (+qty) |
| `receiveStock` | The batch exists and isn't expired; qty is an integer from 1 to 100,000 | Adds qty to the batch and appends a `STOCK_IN` transaction |
| `adjustStock` | Direction, qty ≥ 1 and a reason are required; **a decrease must be ≤ the batch quantity**; an increase is blocked on an expired batch; Other requires remarks | Updates the batch and appends an `ADJUSTMENT_*` transaction |
| `updateSettings` | Name 2–60 characters; days is an integer from 1 to 365 | Updates the settings |
| `resetDemoData` | — | Replaces the inventory with `generateSeed(today)` |

The non-negative stock invariant is checked in three places: the Zod schema, the service, and a final `assertInvariants(state)` guard that runs in development and tests.

### 3.5 Seed design (`generateSeed(today)`, deterministic, with a fixed PRNG seed)
- **25 medicines** across 8 categories, with fictional brands (e.g. *Paracare 650*, *Amoxiva 500*), real generic names (e.g. Paracetamol, Amoxicillin, Metformin, Amlodipine, Cetirizine, Pantoprazole, Cholecalciferol, Salbutamol) and fictional manufacturers (e.g. *Veridian Pharma*, *Northstar Labs*). **4 are inactive.**
- **38 batches.** Expiry dates are offsets from today, chosen to guarantee 8 expired (including one at day −1), 2 that expire today, 6 expiring soon (including one at day 1 and one at day 30) and 22 valid batches (including one at day 31). 22 batches use opening balances and 16 were created inside the history window (see C4).
- **6+ low-stock medicines** by construction. One of them has all its stock expired, so its usable stock is 0. One more low-stock medicine is inactive, to demonstrate that it is excluded.
- **30 transactions** spread over the last 6 months: 16 `BATCH_CREATED`, 10 `STOCK_IN`, 2 `ADJUSTMENT_INCREASE` and 2 `ADJUSTMENT_DECREASE` (one of them an *Expired – disposed* write-off). Their `quantityAfter` chains are consistent (see C4).
- A seed integrity test asserts the counts, the references, the chains, and the presence of every status at a fixed "today".

---

## 4. Design system spec

### 4.0 Minimal palette (revision 3, chosen by you)
The palette was revised to a **minimal** direction, based on references from pharmacy and health dashboard style guides:
- **Canvas and text:** a warm off-white canvas (`#FAFAF8`), white surfaces, near-black ink (`#161616`), stone greys for secondary text, and hairline borders (`#ECEBE8`).
- **One accent, used sparingly:** a muted deep green, `#1F6B4F` (hover `#2A7D5E`, press `#175740`, tint `#EEF5F1`). It appears on primary buttons, the active nav item, focus rings and key chart marks, and nowhere else.
- **Status colors:** muted amber (`#92600A`), rust (`#A8481F`, expires today) and red (`#B42318`). They appear only in small badges and indicators, always with an icon and a text label.
- **Charts:** a monochrome green ramp plus stone neutrals, with no rainbow palettes.
- **Depth:** cards rely on borders first, with a barely-there shadow (`0 1px 2px rgb(22 22 22 / .03)`). Raised shadows are reserved for overlays. No gradients on UI chrome.
- The hex values in the table below are superseded by `src/design-system/tokens/index.css`.

### 4.1 Tokens
Tokens are CSS variables in `design-system/tokens/*.css`, exposed to Tailwind v4 through `@theme`. Components use only semantic utilities such as `bg-surface`, `text-fg-muted` and `border-subtle`, never raw hex values or palette shades.

| Group | Light | Dark |
|---|---|---|
| `--color-bg` | `#ffffff` | slate-950 |
| `--color-bg-subtle` | slate-50 | slate-900 |
| `--color-surface` | `#ffffff` | slate-900 |
| `--color-border-subtle` | slate-200 / 70% | slate-700 / 60% |
| `--color-fg` / `-muted` / `-faint` | slate-900 / slate-600 / slate-400 | slate-50 / slate-300 / slate-500 |
| `--color-primary` / `-hover` / `-press` / `-tint` | emerald-600 / 500 / 700 / 50 | emerald-500 / 400 / 600 / emerald-950 |
| `--color-success` / `-soft` | emerald-600 / emerald-50 | emerald-400 / emerald-950 |
| `--color-warning` / `-soft` | amber-600 / amber-50 | amber-400 / amber-950 |
| `--color-urgent` / `-soft` | orange-700 / orange-50 | orange-400 / orange-950 |
| `--color-danger` / `-soft` | rose-600 / rose-50 | rose-400 / rose-950 |
| `--color-ring` | emerald-500 | emerald-400 |

Contrast is checked against AA for every foreground/background pair. Warning text uses amber-700 on amber-50, because amber-600 fails AA for small text.

**Expiry badge mapping.** The badges never rely on color alone: each one pairs a color with an icon and a text label.

| Status | Color | Icon | Label |
|---|---|---|---|
| Valid | success | `ShieldCheck` | "Valid · 142 days" |
| Expiring Soon | warning | `Clock` | "Expiring soon · 12 days" |
| Expires Today | urgent | `AlarmClock` | "Expires today" |
| Expired | danger | `XCircle` | "Expired · 4 days ago" |

### 4.2 Typography
- Font family: `-apple-system, "SF Pro Display", "Inter Variable", system-ui, sans-serif`. Inter Variable is self-hosted through `@fontsource-variable/inter`, latin subset only.
- Scale (size/line-height): `xs 12/16`, `sm 14/20`, `base 16/24`, `lg 20/28`, `xl 24/32`, `2xl 32/40`, `display 48/52`.
- Tracking: −0.02em at ≥24px, −0.01em at 20px, and 0 for body text.
- Weights: 400 body, 500 UI, 600 headings, 650 display.
- `.tabular` (`font-variant-numeric: tabular-nums`) is applied to every quantity, price, date and count.

### 4.3 Spacing and layout
- 8pt grid; 4px is allowed only for icon-to-label gaps.
- Content area: 12 columns, 24px gutters (16px on mobile), and `max-width: 1440px`.
- Dashboard bento: 12 columns at ≥1280px, 6 at tablet, and 1 stacked column on mobile.

### 4.4 Radii, shadows and materials
- Radii: `--radius-sm 8px` (inputs, badges), `--radius-md 12px` (buttons), `--radius-lg 16px` (cards), `--radius-xl 20px` (dialogs and hero tiles), and `--radius-full`.
- Shadows:
  - `--shadow-xs: 0 1px 2px rgb(15 23 42 / .04)`
  - `--shadow-card: 0 1px 2px rgb(15 23 42 / .04), 0 8px 24px -8px rgb(15 23 42 / .08)`
  - `--shadow-raised: 0 2px 4px rgb(15 23 42 / .05), 0 16px 40px -12px rgb(15 23 42 / .14)` (used for hover, popovers and dialogs)
- **Card material:** surface + 1px `border-subtle` + `shadow-card` + `radius-lg`.
- **Glass material:** `bg-white/70` + `backdrop-blur-xl` + border white/40, used **only** for the header, sidebar, dialogs and sheets, and the welcome hero overlays. Where `backdrop-filter` isn't supported, it falls back to solid `bg-surface`.

### 4.5 Motion tokens (`design-system/motion/tokens.ts`)
```ts
springs = {
  snappy: { type: 'spring', stiffness: 420, damping: 32 },
  smooth: { type: 'spring', stiffness: 260, damping: 28 },
  gentle: { type: 'spring', stiffness: 140, damping: 20 },
};
durations = { micro: 0.15, ui: 0.26, page: 0.4, pageExit: 0.18 };
easings = { out: [0.22, 1, 0.36, 1], inOut: [0.65, 0, 0.35, 1] };
stagger = { cards: 0.04, rows: 0.02 };
```

### 4.6 Interaction states
- Every interactive primitive implements hover, active (`scale: 0.97`, snappy spring), focus-visible (2px ring with 2px offset), disabled (50% opacity with a not-allowed cursor) and loading (a spinner that keeps the element's width).
- These states live in the primitives, not in feature code.

### 4.7 Primitives
Button, IconButton, Card, Badge (status variants include an icon and a text label, so status isn't conveyed by color alone), Input, NumberInput, Textarea, Select, Combobox (medicine picker), DatePicker (native `type=date`, styled), Dialog, Sheet, ConfirmDialog, Dropdown, Popover, Tabs/SegmentedControl, Table, DataTable, Pagination, Toast, Skeleton, EmptyState, StatCard, ProgressBar, SearchInput, Tooltip, Avatar, Kbd, CommandPalette.

Dialog focus trapping and dismissal come from **`@radix-ui/react-dialog`, `react-popover`, `react-dropdown-menu` and `react-tooltip`**. They are unstyled and accessible, so this avoids hand-rolling focus traps (see §9 for the dependency justification).

---

## 5. 3D plan

| Where | What | Why | Fallback |
|---|---|---|---|
| **Welcome hero** (the only full scene) | 5–7 two-tone capsules (`MeshPhysicalMaterial`, clearcoat 1, roughness ~0.25), one amber medicine bottle with a white cap and a label plane, and a soft emerald medical cross with a rounded extrusion. Gentle float (sine with per-object phase), pointer parallax (±0.15 rad lerped), slow camera drift, `Environment` (a small studio HDR preset, about 1 MB, lazy-loaded), and `ContactShadows`. | Sets the brand: craft and calm in the first impression. | A pre-rendered still of the same scene (AVIF/WebP), which is also the LCP image. |
| **Dashboard hero tile** | A single slowly rotating capsule (≤0.2 rad/s), in the same chunk and with the same materials. | One accent to tie the app to the welcome screen. | A static capsule image. |
| **Everywhere else** | No WebGL. Depth comes from CSS `perspective` + `rotateX/Y` tilt (±6°) with a specular gradient that follows the cursor on stat cards. | Data-heavy pages stay fast and calm. | With reduced motion, the tilt is off. |

**`CanvasShell` behaviour**
- Lazy-loaded with `React.lazy` and Suspense.
- `aria-hidden`, with a visually hidden text alternative (for example, "Illustration of floating capsules, a medicine bottle and a medical cross").
- Paused with `IntersectionObserver` when it is offscreen and with `visibilitychange` when the tab is hidden; in both cases it switches to `frameloop="never"`.
- `frameloop="demand"` with `invalidate()` driven by the float clock, which stops after 20s without pointer input.
- `<AdaptiveDpr pixelated={false}>`, with `dpr` set to `[1, 1.75]`, plus `<PerformanceMonitor>`, which degrades to the static fallback on sustained FPS drops.

**Capability gate** (`useCanRender3D`): renders the static fallback when any of the following is true:
- WebGL2 is unavailable
- `prefers-reduced-motion` is set
- `navigator.connection.saveData` is on
- `deviceMemory` ≤ 4
- `hardwareConcurrency` ≤ 4

**Budget**
- Geometry is procedural only (capsules = `CapsuleGeometry`, the bottle = a lathe, the cross = a rounded-box extrusion), with no GLTF files.
- Under 60k triangles and under 25 draw calls, with shared materials.
- The 3D chunk (three + R3F + the drei helpers I use) is about 230 KB gzip, is never in the initial bundle, and is prefetched on idle from the Welcome page.
- Target: 60fps on a mid-range laptop and under 16ms per frame.

**Static still:** I'll capture it from the running scene in Phase 7 (Chrome DevTools screenshot, then convert). Until then, the fallback is an emerald-to-slate radial gradient with an SVG capsule motif.

---

## 6. Motion choreography

| Surface | Choreography | Reduced motion |
|---|---|---|
| **Page** | `AnimatePresence mode="popLayout"` keyed by the pathname's first segment. Enter: opacity 0→1, y 8→0, scale 0.99→1, 400ms with the `out` easing. Exit: opacity →0, 180ms. `pointer-events` is never disabled. | Opacity only, 150ms |
| **Dashboard** | Tiles stagger in 40ms apart (smooth spring). KPI numbers count up from 0 over 600ms on mount, and tween from old to new on change. | No count-up, no stagger |
| **Lists / DataTable** | The first 12 rows stagger in 20ms apart on first mount only (not on paging or filtering, which swap instantly with a 120ms fade). After a stock change, the affected row flashes `primary-tint` and fades out over 1.2s. | Flash only (no movement) |
| **Shared elements** | A medicine row → its detail header (`layoutId=medicine-{id}`, smooth spring). A dashboard KPI tile → the target page's header chip (`layoutId=kpi-{key}`), inside a `LayoutGroup` around the routed outlet. | Disabled (plain page fade) |
| **Modal / Sheet** | The backdrop fades 0→1 while its blur goes 0→8px over 200ms. Dialogs scale 0.96→1 with opacity (snappy). Sheets slide in from the right on desktop and from the bottom on mobile (smooth). Exits are about 30% faster. | Opacity only |
| **Dropdown / Popover** | Scale 0.96→1 from the Radix transform origin, 150ms. | Opacity only |
| **Toast** | Desktop: enters from bottom-right, x 24→0 (snappy). Mobile: enters from the top. Exits with a slide and fade. Stacked toasts compress with a layout animation. A toast with an undo action shows a progress bar. | Opacity only |
| **Sidebar** | Width springs between 264px and 72px (smooth). Labels fade out over the first 40% of the motion; icons stay pinned at x = 24px. On mobile, the "More" sheet uses the Sheet motion. | Instant width change |
| **Charts** | Mounted when 30% in view (`useInView`, once). Recharts' native `isAnimationActive` animation runs over 700ms with ease-out. The donut sweeps; the bars grow from the baseline. | `isAnimationActive={false}` |
| **Badges** | Pulse once (scale 1→1.08→1, with a ring fade) when a status changes. | Off |
| **Forms** | Nothing animates while the user is typing. Validation messages fade in over 150ms, with no movement and no layout shift (space is reserved). | Same |
| **Welcome CTA** | A magnetic pull of up to 8px toward the cursor within a 120px radius (gentle spring). | Off |

---

## 7. Image plan

| Slot | Subject | Size | Notes |
|---|---|---|---|
| Welcome hero backdrop | Bright, modern pharmacy interior (soft focus) | 2400×1600 | Behind the 3D scene, at low opacity with an emerald gradient overlay; `fetchpriority="high"` |
| Welcome feature strip | Medicine shelves / capsules macro / supplies | 3 × 800×600 | Lazy-loaded |
| Dashboard hero tile | Capsules or blister packs, close up | 1200×800 | Next to the 3D capsule accent |
| Empty states | — | — | Lucide icon compositions in an SVG tile, so no photos are needed |
| 404 | Medicine bottle still life | 800×600 | Lazy-loaded |

- **Source:** free-licence images from Unsplash or Pexels. A script (`scripts/fetch-images.mjs`) downloads them into `src/assets/images/source/` once, and the images are committed with no hotlinking. Credits (photographer, URL and licence) go in the README.
- **Pipeline:** `vite-imagetools` generates AVIF + WebP + a JPEG fallback at widths of 480, 960, 1440 and 2400 inside a `<picture>` with `srcset`/`sizes`, plus a 24px-wide inline WebP for the blur-up placeholder.
- **Loading:** explicit `width` and `height` on every image (no CLS). `loading="lazy"` and `decoding="async"` everywhere except the hero.
- **Grade:** a CSS overlay (`linear-gradient(emerald-900/15 → transparent)` with `mix-blend-mode: multiply`) plus `saturate(.9)`, so every image reads as one system with no extra build step.
- **Fallback:** if a download fails, a generated SVG or gradient placeholder with the same dimensions and an emerald/slate palette takes its place.

---

## 8. Folder structure

```
.
├─ docs/  FRONTEND_PLAN.md  REQUIREMENTS.md  ADDING_A_MODULE.md
├─ scripts/  fetch-images.mjs
├─ src/
│  ├─ main.tsx
│  ├─ app/
│  │  ├─ registry.ts  router.tsx  providers.tsx
│  │  ├─ layouts/  AppShell.tsx  BareLayout.tsx  Sidebar/  Header/  MobileTabBar/
│  │  ├─ header/   Breadcrumbs.tsx  CommandPalette.tsx  NotificationBell.tsx  UserMenu.tsx
│  │  └─ errors/   RouteErrorBoundary.tsx  NotFound.tsx
│  ├─ design-system/
│  │  ├─ tokens/   colors.css  typography.css  radii.css  shadows.css  index.css
│  │  ├─ primitives/  Button/ Card/ Badge/ … DataTable/ CommandPalette/ (one folder each, with index.ts)
│  │  └─ motion/   tokens.ts  variants.ts  PageTransition.tsx  Stagger.tsx  CountUp.tsx
│  │               Tilt.tsx  Magnetic.tsx  useReducedMotion.ts
│  ├─ three/
│  │  ├─ CanvasShell.tsx  useCanRender3D.ts  WelcomeScene.tsx  CapsuleAccent.tsx
│  │  ├─ objects/  Capsule.tsx  Bottle.tsx  MedicalCross.tsx
│  │  └─ rigs/     StudioLights.tsx  materials.ts
│  ├─ data/
│  │  ├─ seed/       catalogue.ts  generateSeed.ts  prng.ts
│  │  ├─ store/      inventoryStore.ts  uiStore.ts  schema.ts  migrations.ts
│  │  ├─ selectors/  expiry.ts  stock.ts  kpis.ts  charts.ts  notifications.ts  reports.ts  index.ts
│  │  └─ services/   medicines.ts  batches.ts  adjustments.ts  settings.ts  result.ts  invariants.ts  index.ts
│  ├─ modules/
│  │  └─ <module>/  components/  hooks/  pages/  schemas/  routes.tsx  module.config.ts  index.ts
│  │     (welcome, dashboard, medicines, stock, expiry, low-stock, transactions, reports, settings)
│  ├─ shared/
│  │  ├─ format/  currency.ts  dates.ts  numbers.ts
│  │  ├─ csv/     toCsv.ts  download.ts
│  │  ├─ hooks/   useToday.ts  useUrlState.ts  useDebouncedValue.ts  useMediaQuery.ts
│  │  ├─ routes.ts  memo.ts  types.ts  constants.ts
│  └─ assets/images/  source/  (originals; variants are generated at build time)
├─ tests/  setup.ts  fixtures/  (unit tests sit next to their source as *.test.ts)
├─ index.html  vite.config.ts  tsconfig*.json  eslint.config.js  .prettierrc  package.json  README.md
```

**DataTable contract:**
- `DataTable<T>({ rows, columns, urlStateSchema, getRowId, mobileCard, emptyState, flashIds })`
- `useUrlState(zodSchema)` parses the search params with defaults, so a bad parameter falls back to its default instead of crashing.
- Search is debounced by 250ms.
- Filtering, sorting and paging happen in pure `shared/table.ts` helpers, which the CSV export reuses so it outputs exactly the filtered and sorted rows.
- Desktop uses a sticky header; below 768px, the table switches to the `mobileCard` renderer.

---

## 9. Dependencies

**Runtime, required by the docs.** These are the latest stable releases, checked with `npm view` on 2026-10-31:

| Package | Version | Note |
|---|---|---|
| `react`, `react-dom` | ^19.3.1 | `ref` is a plain prop, so no `forwardRef`; uses `useOptimistic` for undo toasts |
| `react-router` | ^8.5.1 | Data mode (`createBrowserRouter`, lazy routes). I'll confirm the v8 API through docs at the start of P1. |
| `framer-motion` | ^14.9.0 | |
| `three` | ^0.187.0 | |
| `@react-three/fiber` | ^9.8.2 | Peer `react >=19 <19.4`, so React stays on 19.3.x |
| `@react-three/drei` | ^10.7.9 | |
| `recharts` | ^3.10.1 | |
| `lucide-react` | ^1.66.0 | |
| `react-hook-form` | ^7.91.0 | |
| `@hookform/resolvers` | ^6.0.2 | |
| `zod` | ^4.6.7 | |
| `date-fns` | ^4.4.0 | |

The **R3F peer range caps React below 19.4**, so I'll pin React to `~19.3.1` until R3F widens its range. Any peer-dependency mismatch found at install time will be reported, never forced with `--legacy-peer-deps`.

**Allowed helpers:** `zustand`, `clsx`, `tailwind-merge`, `@fontsource-variable/inter`.

**Additional runtime dependencies (one-line justification each):**
- `@hookform/resolvers`: the official bridge between React Hook Form and Zod, which the doc's form stack requires.
- `@radix-ui/react-dialog`, `react-popover`, `react-dropdown-menu` and `react-tooltip`: unstyled, accessible focus trapping, dismissal and positioning, needed for WCAG 2.2 AA. Hand-rolling these is a common source of a11y bugs.
- `cmdk`: accessible keyboard navigation for the ⌘K command palette (about 4 KB). *If you'd prefer no extra package, I'll build it on Radix Dialog plus a listbox.*

**Dev dependencies:**
- `vite@8`, `@vitejs/plugin-react`, `typescript@7`: the build toolchain. If typescript-eslint doesn't yet support TS 7, I'll pin the latest TS version it does support and note it.
- `tailwindcss@4` + `@tailwindcss/vite`: the doc's styling stack. v4's `@theme` maps CSS-variable tokens directly into utilities.
- `vite-imagetools`: the image pipeline required by the prompt.
- `vitest@5`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`: the required unit and component tests.
- `eslint`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `prettier`, `prettier-plugin-tailwindcss`: the required lint and format setup.
- `rollup-plugin-visualizer`: checks the ≤200 KB initial JS budget.

---

## 10. Milestones (mapped to the requirements doc's 8 phases)

Every phase ends with `npm run build`, `npm run lint` and `npm test` all green, then a summary (done, next, trade-offs), then small commits.

**Commit convention**
- Subject of 6 words or fewer.
- Body of 15 words or fewer, or no body.
- No co-author or "generated by" trailers.
- No comments in source code (per your global instructions). Explanations live in the README and the docs.

| # | Doc phase | Deliverables | Exit check |
|---|---|---|---|
| **P1** | Setup, routing, layout, design system | `git init`; Vite + TS strict + Tailwind v4 + ESLint/Prettier/Vitest; tokens (light + dark); motion tokens; core primitives (Button, Card, Badge, Input, Dialog, Sheet, Dropdown, Tooltip, Toast, Skeleton, EmptyState); module registry; AppShell with the collapsible sidebar, header and breadcrumbs, and the mobile tab bar; a lazy route per module with placeholder pages and error boundaries; PageTransition | Every route renders in the shell; keyboard navigation works through the sidebar and header; build is green |
| **P2** | Dummy data, localStorage, reusable components | Types; `generateSeed(today)`; zustand store with persist, versioning and migrations; **all selectors and services with full unit tests** (expiry boundaries at −1 Expired / 0 Expires Today / 1 and 30 Expiring Soon / 31 Valid, threshold changes, opening balance + Σ changes = quantity, usable stock excluding expired, no negative stock, low-stock edge cases including inactive medicines and zero usable stock, threshold changes); `useToday`; `useUrlState`; DataTable + Pagination + SearchInput + filter chips; StatCard; ConfirmDialog; CSV utils; formatters | Seed integrity test passes; selector and service coverage ≥ 95% |
| **P3** | Dashboard + Medicines | Dashboard bento (KPIs with deep links, category donut, monthly additions, low-stock and upcoming-expiry tables); Medicines list, detail page and create/edit sheet (RHF + Zod); activate/deactivate with undo; guarded delete; shared-element row → detail transition; ⌘K palette; notification bell | Component tests for the medicine form; KPIs react live to edits |
| **P4** | Batch stock + Transactions | Stock page; Add Batch, Receive and Adjust dialogs with a live "current → new" preview and the negative-stock block; row flash; Transactions page (read-only, type badges, ± colouring, date range); the Batches and Transactions tabs on Medicine detail | Component tests for the Adjust dialog (blocks negatives, Other requires remarks); a transaction is written for every change |
| **P5** | Expiry + Low Stock | Expiry page (filter chips All / Expires Today / Expiring Soon / Expired / Valid, four-status badges with days left, sorted by expiry, "Write off" quick action); Low Stock page (usable vs minimum progress bar, links to the medicine and its batches, Receive quick action) | The threshold change in P6 visibly recomputes these pages |
| **P6** | Reports + Settings | Reports segmented control with all 6 reports, each with its own filters; CSV export of exactly the rows shown (UTF-8 BOM, `medistock-<report>-yyyy-MM-dd.csv`); Settings form; Reset Demo Data with confirmation | CSV unit tests (escaping, BOM, filename) |
| **P7** | 3D, animations, responsive | Welcome page (3D scene, live KPI chips, magnetic CTA, first-visit logic); dashboard capsule accent; capability gate and static fallback capture; CSS tilt on stat cards; count-up; badge pulse; chart in-view entrances; full reduced-motion pass; image download and pipeline; responsive pass at 360 / 768 / 1024 / 1280 / 1440 | Chrome DevTools: 60fps trace on Welcome, no CLS, the 3D chunk isn't in the initial bundle |
| **P8** | Testing, fixes, docs | Lighthouse (target 90+ on all four categories); axe pass; bundle report (≤ 200 KB initial gzip); bug fixes; README (setup, scripts, structure, registry, data model, tokens, image credits, reset); `docs/ADDING_A_MODULE.md` | All gates are green; final summary |

**Risks and mitigations**
- **Shared-element morphs across lazy routes:** these can flicker while a chunk loads. I'll prefetch the target route chunk on hover or focus, and the morph is skipped if the chunk isn't ready.
- **Latest-version churn:** React Router 8, TS 7 and Vite 8 are new majors. P1 starts with a dependency smoke test, and any incompatibility is reported with a pinned fallback.
- **Recharts bundle size:** Recharts is about 100 KB gzip. It is isolated in the dashboard and reports chunks only.
- **The Welcome page's LCP vs 3D:** the static still/backdrop is the LCP element, and the canvas fades in over it once it is ready.

---

## 11. Future modules (not built; the architecture is ready for them)
- **Suppliers / Purchase orders:** a new `suppliers` module. `Batch` gains an optional `supplierId`, and a new `PURCHASE_RECEIVED` transaction type plugs into the same services.
- **Sales / Billing:** a `SALE` transaction type that decrements stock first-expiry-first-out through the existing `adjustStock` invariants.
- **Multi-branch:** `branchId` on `Batch` and `StockTransaction`, with a branch selector in the header. Selectors take a `branchId` filter.
- **Auth / roles:** a `featureFlag` and a `requiredRole` on `ModuleConfig`, read by the registry.
- **Backend sync:** services already return `Result`. Swap the store binding for an API adapter without touching the UI.
- **Notifications (email/SMS):** a consumer of `selectNotifications`.

---

**⏸ Stopping here for approval.** Reply "approved" (or with changes) and I'll start Phase 1.

---

## 12. Delivery status (2026-10-31)

All eight phases are complete. The work ran as two waves of parallel agents, each agent in its own git worktree, and each branch was merged and re-verified on `main`:
- **Wave 1:** data layer · design system · 3D and images.
- **Wave 2:** dashboard · medicines · stock and transactions · expiry and low stock · reports and settings · welcome.

| Gate | Result |
|---|---|
| Typecheck / lint | Clean (TypeScript strict, ESLint with the module-boundary rules) |
| Tests | 280 passing across 33 files; `src/data` coverage is about 99% |
| Initial JS | 187 KB gzip (budget about 200 KB). three.js, Recharts and cmdk all load lazily |
| Lighthouse (dashboard desktop, medicines mobile) | Accessibility 100 · Best Practices 100 · SEO 100 |
| Core Web Vitals (dashboard, mobile, 4× CPU, Fast 4G) | LCP 2.4 s · CLS 0.00 |
| End-to-end (production build) | Receive stock → batch +100, one `STOCK_IN` written, toast shown, bell 23 → 22, medicine leaves Low Stock |
| Responsive | Every route checked at 375 px with no horizontal overflow; light and dark themes checked |
| 3D frame rate (Welcome, AMD Radeon 680M integrated, 5 s with pointer movement) | 59.9 fps, p95 frame 17.0 ms, 0 frames over 20 ms, no long tasks. Still 59.9 fps with a 4× CPU slowdown |
| Welcome load (4× CPU) | LCP 2.2 s · CLS 0.01 |

**Interaction polish (follow-up)**
- **Global baseline:** every interactive element (links, buttons, tabs, menu items, form controls, table rows) eases color, background, border, underline, shadow and opacity changes over 160 ms. The baseline is in `tokens/index.css` and uses `:where()`, so any component utility overrides it.
- **Utilities:**
  - `link-underline` fades an underline in on hover and on keyboard focus.
  - `lift` raises interactive cards 2 px and strengthens the shadow and border.
  - `nudge` moves trailing arrows 3 px forward; buttons with a trailing icon get it automatically.
- **Micro-interactions:** sidebar and header icons scale up slightly on hover and down on press, mobile tab icons compress on press, and the welcome feature images zoom gently.
- **Reduced motion:** all movement is gated behind `prefers-reduced-motion: no-preference`. With reduced motion on, only colors change.
- **Bugs fixed:** a row that changes twice in a row now flashes again (the highlight alternates between two identical keyframes so it restarts). The report tabs now show no selection on an unknown report URL.

**Known trade-offs**
- **KPI-card → page-header morph:** dropped. Morphing a whole card into the header text distorted the text mid-transition, so the standard page transition is used instead. The medicine row → detail header morph does ship.
- **3D chunk size:** about 245 KB gzip, against a target of about 230 KB. It loads only on the Welcome screen and the dashboard's hero tile (never on phone widths), and devices that fail the capability check get a static render instead.
- **Image credits:** the photographers' names still need to be looked up on unsplash.com (see `docs/IMAGE_CREDITS.md`).
