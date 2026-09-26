# B4 — Dashboard & Reports → Untitled UI

Date: 2026-09-26 · Owner: b4-dash-reports · Scope: `src/features/dashboard/**`, `src/features/reports/**`
Status: DONE

## Files modified

New:
- `src/features/dashboard/components/widget-card.tsx` — shared UUI card shell (rounded-lg border border-primary bg-primary, optional title/description, p-4 body, contentClassName override). Used by all six dashboard widgets.
- `src/features/reports/components/table.tsx` — dense table primitives (Table/TableHeader/TableBody/TableRow/TableHead/TableCell) restyled from ui/table with UUI tokens (text-tertiary heads, border-primary rows, hover:bg-secondary). Same DOM shape, so TanStack render code ports 1:1.

Rewritten (restyle + recompose only; all react-query hooks, services calls, date logic, xlsx export logic, doc-title behavior kept):
- `dashboard/index.tsx` — PageHeader replaces manual h1 + useDocumentTitle (title behavior preserved: PageHeader sets the document title internally); charts/top rows keep lg:grid-cols-7 spans (widgets now self-contained cards, wrapped in col-span divs).
- `dashboard/components/today-stats.tsx` — stat cards on the border-primary recipe, text-display-md numbers, UUI icons (Wallet01/Package/CheckCircle/AlertCircle); TrendText rebuilt with ArrowUp/ArrowDown icons and text-success-primary/text-error-primary; skeleton = animate-pulse bg-secondary blocks.
- `dashboard/components/monthly-revenue-chart.tsx` + `-inner.tsx` — lazy/Suspense/useQuery untouched; chart config color `var(--color-brand-500)` (Bar fill stays `var(--color-total)` via ChartStyle); grid stroke `var(--color-border-primary)`, axis ticks `var(--color-text-quaternary)`; Skeleton → pulse div.
- `dashboard/components/recent-invoices.tsx` — status chips → UUI `BadgeWithIcon` pill-color (cancelled=gray, pending=warning, paid=success, unpaid=error); WidgetCard; divide-primary rows.
- `dashboard/components/outstanding-debts.tsx`, `top-customers.tsx` — WidgetCard, rank circles bg-secondary, debt amounts text-warning-primary.
- `dashboard/components/top-products.tsx` — WidgetCard; progress bar track bg-secondary / fill bg-brand-solid.
- `reports/customers/index.tsx` — UUI Button (isLoading) + Label + UUI Select (selectedKey/onSelectionChange, SelectItem from select-item path); native `<input type='date'>` kept functional, restyled with UUI input classes (ring-primary, focus ring-brand, h-9); KPI stat cards; empty wrapper bg-primary.
- `reports/customers/components/export-actions.tsx` — UUI Dropdown (Root/Button secondary + Popover bottom end + Menu onAction); xlsx/print handlers and HEADERS untouched; dropped now-unused open state (UUI Root manages its own state).
- `reports/customers/components/customer-report-table.tsx`, `customer-report-mobile.tsx` — local UUI table primitives / token restyle (text-tertiary, bg-secondary, text-warning-primary); grouping/sorting/summary logic untouched.
- `reports/products/index.tsx`, `product-report-table.tsx`, `product-report-mobile.tsx` — same patterns; expand chevron → UUI Button tertiary xs icon-only; success amounts text-success-primary; detail table kept, SearchMd icon.

## Verification

- `npx tsc -b` → 0 errors (whole project).
- `pnpm exec eslint src/features/dashboard src/features/reports` → 0 errors, 1 warning (pre-existing react-hooks/incompatible-library on `useReactTable`, same call as baseline).
- `node scripts/guard-design-tokens.mjs` → clean.
- `pnpm vitest run src/features/dashboard src/features/reports` → no test files exist for these dirs (exit "No test files found"); nothing skipped or hidden.
- `grep lucide` → empty; `@/components/ui/` → only `ui/chart` (chart wrapper, allowed).
- Vietnamese copy spot-check: all original strings present.

## Notes for other batches

- Legacy shadcn aliases (text-muted-foreground, bg-muted, text-warning, bg-card) are gone from my scope; I used UUI tokens throughout (text-tertiary/secondary/primary, bg-secondary, border-primary, text-warning-primary/success-primary, bg-brand-solid).
- Icon renames used: Wallet01, Users01, CurrencyDollar, TrendUp01, ShoppingBag02, CoinsHand, Trophy01 (unused after title restyle → removed), File02, SearchMd, Download01; Clock/XCircle/CheckCircle/AlertCircle/Package keep their names.
- No test files existed to update; none added (no behavior change to test, pure restyle).
