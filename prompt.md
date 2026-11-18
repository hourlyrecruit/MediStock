# MediStock — Claude Code Build Prompt

## Role
You are a senior frontend architect and motion/interaction designer. You've shipped products to Apple's Human Interface Guidelines standard, and you think like the teams behind Linear, Stripe, Vercel and Apple Health. You care about craft: every transition has a purpose, every pixel sits on an 8pt grid, and the code stays clean enough to grow for years.

## Mission
Build **MediStock**, a premium, frontend-only medicine stock and expiry management app for small pharmacies, medical stores and clinics. It should feel like a high-end healthcare SaaS product: calm, precise and trustworthy, with tasteful 3D on the welcome screen and in selected dashboard elements. Motion should feel physically natural, and the architecture must be modular so new modules (e.g. suppliers, billing, multi-branch) can be added later without touching existing ones.

The full requirements are in `MediStock_Frontend_Project_Requirements.docx` (or its .md export) in this repo. Treat that document as the source of truth; this prompt adds the design, architecture and quality standard. **If the two conflict, the requirements document wins.** Flag any conflict you find.

---

## Phase 0 — Discover (change nothing yet)
1. Read the requirements document fully. Also read any existing code and config in the repo.
2. Summarise the modules, entities, business rules and out-of-scope items in your own words.
3. List any ambiguities as numbered questions. Where an ambiguity doesn't block the architecture, state your assumption and carry on.

## Phase 1 — Plan (write `/docs/FRONTEND_PLAN.md`, then STOP for my approval)
The plan must include:
- Sitemap and routes, the main user flows, and the navigation model
- A module map showing what each module owns and how modules talk to each other
- The data model with TypeScript types, plus the derived selectors (see Domain Rules)
- The design system spec: tokens, type scale, color, materials, radii, shadows and motion tokens
- The 3D plan: exactly where 3D appears, why it's there, its fallback, and its performance budget
- The motion choreography for page, list, modal, toast, sidebar and chart transitions
- The image plan: which images go where, where they come from, and how they're optimised
- The folder structure, and the milestones mapped to the 8 phases in the requirements document

**Do not write feature code until I approve the plan.**

---

## Tech stack (fixed by the requirements document; don't swap anything)
- React 18 + Vite, written in **TypeScript (strict)** for scalability
- Tailwind CSS (all theme values come from CSS-variable design tokens)
- React Router v6 (data router, lazy-loaded routes)
- Framer Motion
- Three.js + React Three Fiber (+ `@react-three/drei` helpers)
- Recharts
- Lucide React
- React Hook Form + Zod
- date-fns
- localStorage persistence

You may add these small helpers only: `zustand` (with the `persist` middleware, for the localStorage-backed store), `clsx` + `tailwind-merge`, and `@fontsource-variable/inter`. Any other dependency needs a one-line justification in the plan.

**Out of scope (do not build):** a backend or database, real auth, sales/billing, suppliers, purchase orders, payments, barcode scanning, AI features, email/SMS/WhatsApp notifications, multi-branch support, and patients/prescriptions. The architecture must still make it easy to add these later.

---

## Architecture (modular and scalable)

```
src/
  app/              # App shell, providers, router, layouts, error boundaries
    registry.ts     # Module registry -> builds routes + sidebar + breadcrumbs
  design-system/
    tokens/         # colors, typography, spacing, radii, shadows, motion
    primitives/     # Button, Card, Badge, Input, Select, Dialog, Sheet, Dropdown,
                    # Tabs, Table, DataTable, Pagination, Toast, Skeleton, EmptyState,
                    # StatCard, ConfirmDialog, SearchInput, Tooltip, Avatar
    motion/         # spring presets, variants, PageTransition, Stagger, useReducedMotion
  three/            # CanvasShell (lazy, Suspense, fallback, offscreen pause),
                    # Capsule, Bottle, MedicalCross, lighting rigs, materials
  data/
    seed/           # medicines, batches, transactions, settings (deterministic)
    store/          # zustand store + persist, versioned schema + migrations
    selectors/      # pure derived-data functions (usable stock, expiry, low stock…)
    services/       # inventory actions: addBatch, receiveStock, adjustStock…
  modules/
    dashboard/  medicines/  stock/  expiry/  low-stock/
    transactions/  reports/  settings/  welcome/
      └─ each: components/ hooks/ pages/ schemas/ routes.tsx module.config.ts index.ts
  shared/           # utils (formatINR, csv export, dates), hooks, types, constants
  assets/images/    # optimised local images (AVIF/WebP + fallback)
```

Rules:
- **Module registry:** each module exports `module.config.ts` with `{ id, label, icon, path, routes, navOrder, featureFlag?, breadcrumb }`. The app shell builds the routes, sidebar and breadcrumbs from the registry, so adding a module means adding one folder and one registry line.
- Modules import only from `design-system`, `three`, `data`, `shared`, or another module's public `index.ts`. They never reach into another module's internals.
- **All business logic lives in pure `selectors/` and `services/`.** Components never compute stock or expiry inline. This is what makes the dashboard update automatically everywhere.
- Every route is lazy-loaded and wrapped in an error boundary. Three.js and Recharts are loaded in their own chunks.
- Write a `/docs/ADDING_A_MODULE.md` walkthrough at the end.

---

## Domain rules (must be exact)

**Entities**
- `Medicine`: id, name, genericName, category, manufacturer, unitPrice (INR), minStockLevel, description, isActive, createdAt, updatedAt
- `Batch`: id, medicineId, batchNumber, quantity, expiryDate, receivedDate, createdAt
- `StockTransaction`: id, medicineId, batchId, type (`STOCK_IN` | `ADJUSTMENT_INCREASE` | `ADJUSTMENT_DECREASE` | `BATCH_CREATED`), quantityChange (signed), quantityAfter, date, remarks?
- `Settings`: pharmacyName, currency = `INR`, expiryAlertDays = 30

**Business rules**
- **Expiry status per batch,** computed against *today* using date-fns with day granularity:
  - `daysLeft < 0` → **Expired**
  - `0 ≤ daysLeft ≤ expiryAlertDays` → **Expiring Soon** (the requirements say 1–30 days. Decide how expiring *today* is handled, i.e. `daysLeft = 0`, and document the choice.)
  - otherwise → **Valid**
  - The threshold comes from Settings, never from a hard-coded value.
- **Usable stock** = sum of quantities of *non-expired* batches. Expired quantity is always shown separately and never counted as usable.
- **Low stock:** usable stock < minStockLevel. Decide whether inactive medicines are included or excluded, and document the choice.
- **No negative stock, ever:** enforce it in the Zod schemas *and* in the service layer.
- Every stock change writes an immutable transaction and updates the batch. The dashboard, alerts and header notification count all derive from the same selectors, so everything updates instantly.
- Transactions are **read-only** after creation: no edit or delete UI.
- Format money with `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`. Show dates in Indian format (`dd MMM yyyy`).

**Seed data** (realistic, fictional, consistent)
- 25 medicines across 6+ categories (Analgesics, Antibiotics, Antidiabetics, Cardiovascular, Antihistamines, Gastrointestinal, Vitamins & Supplements, etc.), with fictional brand names, real-sounding generic names and fictional manufacturers. Some must be inactive.
- 35–40 batches and 30 transactions, all with consistent references.
- **Generate seed dates relative to today at first load,** so there are always valid, expiring-soon and expired batches, and several low-stock medicines, whenever the app is opened.
- The persisted store has a schema version. **Reset Demo Data** asks for confirmation, then restores the seed (with dates regenerated).

---

## Design language (Apple HIG × premium healthcare SaaS)
- **Feel:** calm, clinical clarity, and warmth. Content is the hero, chrome recedes, and depth shows hierarchy. Follow the HIG principles of clarity, deference and depth.
- **Color tokens** (semantic only, never raw hex in components):
  - primary emerald (`emerald-600` base; `500`/`700` for hover and press; a `50` tint for surfaces)
  - background white / `slate-50`
  - text `slate-900` / `slate-600` / `slate-400`
  - status colors: success emerald, warning amber, danger rose/red, each with a soft tinted background badge variant
  - Define dark-mode tokens now, even if the toggle ships later.
- **Materials:** white cards with a 1px `slate-200/70` border, layered soft shadows (e.g. `0 1px 2px rgb(15 23 42 / .04), 0 8px 24px -8px rgb(15 23 42 / .08)`), and radius 16–20px. Use frosted glass (`backdrop-blur-xl` + `bg-white/70`) **only** for the header, sidebar, dialogs and the welcome hero overlays.
- **Typography:** `-apple-system, "SF Pro Display", "Inter Variable", system-ui`. Tight tracking on display text (-0.02em). Clear scale: 12/14/16/20/24/32/48. Use tabular numbers for all quantities and prices.
- **Layout:** 8pt grid, generous whitespace and a 12-column grid. Use bento-style dashboard tiles, with a max content width of ~1440px.
- **Interaction states:** every interactive element has hover, active (press scale ~0.97), focus-visible (2px emerald ring with offset), disabled and loading states.
- **Microinteractions:**
  - stat numbers count up on load and on change
  - cursor-aware 3D tilt (max ±6°) with a soft specular highlight on dashboard stat cards
  - magnetic primary CTA on the welcome screen
  - shimmering skeleton loaders
  - badges pulse once when a status changes
  - row highlight flash after a stock change
- **Empty states:** a friendly illustration or icon, one sentence, and a primary action.

## Motion system (Framer Motion)
- Central spring tokens: `snappy {stiffness: 420, damping: 32}`, `smooth {stiffness: 260, damping: 28}`, `gentle {stiffness: 140, damping: 20}`.
- Durations: micro 120–180ms, UI 220–320ms, page 350–450ms. **Quick and subtle,** as the requirements document asks.
- **Page transitions:** use `AnimatePresence` keyed by route. Pages enter with opacity 0→1, y 8→0 and a slight scale 0.99→1, and exit faster than they enter. Never block input during a transition.
- **Dashboard:** cards enter staggered (40ms apart). Charts animate in when they scroll into view.
- **Shared-element transitions** (`layoutId`):
  - a medicine row expands into its detail view
  - a dashboard stat card morphs into the target page header
- **Overlays:** modals and sheets spring in from scale 0.96 with a backdrop blur fade. Dropdowns scale from their origin. Toasts slide and spring from the bottom-right (top on mobile).
- **Sidebar:** collapse and expand with a width spring. Labels cross-fade, and icons stay fixed in place.
- **Reduced motion:** respect `prefers-reduced-motion` everywhere. Fall back to opacity-only transitions, turn off tilt, count-up and 3D auto-motion, and render 3D as a static frame or image.
- **Forms:** never animate while the user is typing. Validation messages fade in only.

## 3D (React Three Fiber): selective, lightweight, meaningful
- **Welcome / landing screen** (the hero): floating capsules (two-tone, glossy `MeshPhysicalMaterial` with clearcoat), a medicine bottle and a soft emerald medical cross. Use gentle float, pointer-reactive parallax and camera drift, soft studio lighting with an environment map, and contact shadows.
- **Dashboard:** at most one small 3D accent (e.g. a slowly rotating capsule in the welcome or hero tile). Everywhere else, depth comes from CSS perspective and tilt, not WebGL.
- **No WebGL on data-heavy pages:** Medicines, Stock, Expiry, Transactions and Reports.
- **Performance:**
  - procedural geometry instead of heavy models (or Draco-compressed GLTF under 300 KB)
  - `<AdaptiveDpr>`, DPR capped at 1.75
  - `frameloop="demand"` when the scene is idle; pause the scene when it's offscreen or the tab is hidden
  - lazy-load with Suspense, using a gradient or image fallback
  - detect missing WebGL or low-power devices and fall back to a static render
- Keep 60fps on a mid-range laptop, and keep the 3D chunk out of the initial bundle.

## Imagery
- Use high-quality healthcare imagery (pharmacy interiors, medicine shelves, capsules, bottles, medical supplies), mainly on the welcome screen and in one or two dashboard or empty-state sections. **Never put a large decorative image on every page.**
- Source free-licence images (Unsplash/Pexels), **download them into `src/assets/images`** (no hotlinking), and list the credits in the README. If a download fails, generate tasteful SVG or gradient placeholders with matching dimensions.
- Optimise with `vite-imagetools` or by pre-converting to AVIF/WebP. Use responsive `srcset`, `loading="lazy"`, explicit width and height (no CLS), and a blur-up placeholder.
- Grade images subtly toward the emerald/neutral palette so they feel like one system.

---

## Module specifics (beyond the requirements document)
- **Welcome:** a full-bleed hero with the 3D scene, the pharmacy name from Settings, 3–4 live KPI chips and an "Enter Dashboard" CTA. Show it on first visit only; afterwards it stays reachable from the logo.
- **Dashboard:** bento grid with:
  - KPI cards (total medicines, usable units, low stock, expiring soon, expired), each clickable and deep-linking to the matching page *with filters pre-applied via URL search params*
  - a category donut, a monthly stock additions area or bar chart, and low-stock and upcoming-expiry tables
- **Shared DataTable:** one reusable component powers every list. It handles search (debounced), filters, sorting and pagination, and syncs all of that state to URL search params so views are shareable and survive refresh. Desktop shows a sticky-header table; mobile switches to a compact card list.
- **Medicines:**
  - CRUD through a slide-over sheet form (RHF + Zod)
  - the detail page shows batches, usable vs expired stock, and recent transactions
  - activate/deactivate with an optimistic toast and an undo action
- **Stock:**
  - Add Batch, Receive Stock and Adjust Stock dialogs
  - adjustments require a reason and remarks
  - a live preview shows "current → new quantity" and blocks negative results
- **Expiry:** color-coded badges with days remaining, and quick filter chips (All / Expiring Soon / Expired / Valid). Sort by expiry by default.
- **Low Stock:** shows usable vs minimum with a progress bar, and links to the medicine and its batches.
- **Transactions:** read-only, with type badges and +/- quantity coloring.
- **Reports:** a tab or segmented control for the 6 reports from the requirements. Each report respects the current search and filters, and **Export CSV** exports exactly what is shown (UTF-8 with BOM so Excel reads it correctly, and a dated filename such as `medistock-low-stock-2026-10-31.csv`).
- **Settings:** pharmacy name, INR display, and expiry threshold. Changing the threshold re-computes every status live. Reset Demo Data uses a ConfirmDialog.
- **Header:**
  - page title and breadcrumbs
  - global medicine search as a ⌘K / Ctrl+K command palette with keyboard navigation
  - a notification bell whose count = low-stock + expiring-soon + expired items, with a popover list
  - an avatar menu (a mock user)
- **Responsive:**
  - desktop: full sidebar, collapsible to an icon rail
  - tablet: icon rail by default
  - mobile: a top bar plus a slide-in drawer (or a bottom tab bar for the top 4 routes, with "More"). Touch targets are at least 44px.

---

## Quality bar
- **Accessibility:** WCAG 2.2 AA. Full keyboard support, focus trapping in dialogs, ARIA labels, and status conveyed by text and icon, not by color alone. The 3D canvas is `aria-hidden` and has a descriptive text alternative.
- **Performance:** Lighthouse 90+. Initial JS under ~200 KB gzip, excluding the lazy 3D and chart chunks. LCP < 2.5s, CLS < 0.1.
- **Code:** TypeScript strict with no `any`. ESLint + Prettier. Small, single-purpose components, named exports, and no business logic in JSX.
- **Tests:** Vitest unit tests for every selector and service (expiry boundaries at -1/0/1/30/31 days, usable stock excluding expired, no negative stock, low-stock edge cases), plus a few component tests for forms. Use a fixed fake "today" in tests.
- **README:** setup, scripts, folder structure, the module registry, data model, design tokens, image credits, and how to reset demo data.

## How to work
- Follow the 8 phases in the requirements document. After each phase:
  - run `npm run build` and the tests
  - fix any errors
  - give a short summary of what's done and what's next, plus any trade-offs
  - then continue
- Make small, logical commits with clear messages.
- Never invent requirements outside the scope list. Put nice-to-haves in a "Future modules" section of the plan instead.

**Start with Phase 0 now.**