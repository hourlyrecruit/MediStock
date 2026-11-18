# MediStock — project rules

Source of truth: `docs/REQUIREMENTS.md` (wins conflicts) → `docs/FRONTEND_PLAN.md` (approved plan) → `prompt.md` (design/quality bar).

## Stack (pinned, do not swap)
React 19.3 · React Router 8 (data mode, import from `react-router`) · TypeScript 6 strict · Vite 8 · Tailwind v4 (CSS-first tokens in `src/design-system/tokens/index.css`) · framer-motion 14 · three + R3F 9 + drei 10 · Recharts 3 · lucide-react · react-hook-form + zod 4 + @hookform/resolvers · date-fns 4 · zustand 5 · Radix (dialog/popover/dropdown/tooltip) · cmdk · Vitest 5 + Testing Library.

## Visual direction: minimal
Warm off-white canvas, near-black ink, hairline borders, ONE muted deep-green accent (`primary`, #1F6B4F) used sparingly (primary buttons, active nav, focus, key chart marks). Status colors only in small badges. Charts: green ramp + stone neutrals (`chart-1..7`). Borders over shadows; no decorative gradients on UI chrome; generous whitespace; restrained type weights.

## Theming
Light / Dark / Auto (system) ship now. `useTheme()` from `@/shared/hooks` → `{ preference, resolved, setTheme }`; `data-theme` on `<html>`. Every screen must look right in BOTH themes: only semantic tokens (never `bg-white`, `text-black`, raw hex); charts read colors from CSS vars (`var(--chart-1)`, `var(--fg-muted)`, `var(--border-subtle)`), not hard-coded. Settings page exposes the theme control (segmented Light / Dark / Auto).

## Hard rules
- **No comments in source.** None — not in TS/TSX/CSS/config/tests. Only functional pragmas (`eslint-disable`, `@ts-expect-error`).
- **Motion:** the app runs under `<LazyMotion strict>`. Use `m.div` etc. — never `motion.*` (strict mode throws). Import `m`, `AnimatePresence` from `framer-motion`; spring/duration tokens from `@/design-system/motion`. Motion is an in-app setting (Settings → Motion, On/Off, default On, stored in `uiStore.motion`, mirrored to `data-motion` on `<html>`), and it overrides the OS reduced-motion preference: gate motion with `useReducedMotion` from `@/shared/hooks` (never framer's), and use `motion-safe:`/`motion-reduce:` variants, which key off `data-motion`.
- **Colors:** semantic Tailwind tokens only (`bg-surface`, `text-fg-muted`, `border-border-subtle`, `bg-primary`, `text-success`, `bg-warning-soft`, `text-urgent`, `bg-danger-soft`, `chart-1..8`, …). No raw hex, no `slate-*`/`emerald-*` in modules. Utilities: `card`, `glass` (header/sidebar/dialogs/hero only), `skeleton`, `tabular`, `focus-ring`.
- Type scale: `text-xs/sm/base/lg/xl/2xl/display`. Radii `rounded-sm/md/lg/xl` (8/12/16/20). Shadows `shadow-xs/card/raised`. 8pt spacing.
- **Business logic only in `src/data/selectors` and `src/data/services`.** Components never compute stock/expiry inline. Selectors take `today: Date` (from `useToday()`), never `new Date()`.
- Modules import from `@/design-system`, `@/three`, `@/data`, `@/shared`, or another module's public `@/modules/<id>` index only. Never `@/app/*`. ESLint enforces this.
- Every stock change goes through a service → writes batch + one immutable transaction. No negative stock (Zod + service).
- Money: `formatINR` from `@/shared/format`. Dates: `formatDate` (`dd MMM yyyy`). Quantities/prices get `tabular`.
- URLs: build with `links.*` from `@/shared/routes`. List state (q, filters, sort, page) lives in URL search params via `useUrlState`.
- Status is never color-only: icon + text label.
- Layout must never produce a horizontal scrollbar from 360px up. `DataTable` shows `mobileCard` below 1024px; mark low-priority columns `hideBelowXl`. Scrollbars auto-hide (shown on hover/scroll).
- Every interactive element: hover, active (`active:scale-[0.97]`), focus-visible ring, disabled, loading. Touch targets ≥ 44px on mobile.
- Respect the app Motion setting (`MotionConfig` is driven by it; also gate count-up/tilt/3D with `useReducedMotion` from `@/shared/hooks`).
- Named exports only. No `any`. Small single-purpose components.

## Commands
`npm run typecheck` · `npm run lint` · `npm test` · `npm run build`. All four must pass before committing.

## Git
- Commit subject ≤ 6 words; body ≤ 15 words or none. No Co-Authored-By or "Generated with" lines.
- In a git worktree with no `node_modules`, link the main one instead of installing:
  `cmd //c mklink /J node_modules D:\\Code\\Personal\\Medi\\node_modules` (Git Bash) — do not run `npm install` unless a new dependency is required.
