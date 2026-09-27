# Package B — frontend lib/components/services (fe-lib-debt) — 2026-09-27

Baseline `ffc5f56`. Nothing committed. Scope touched: `frontend/src/components/**`, `frontend/src/services/**`, `frontend/src/lib/handle-server-error.ts`, `frontend/src/context/search-provider.tsx`, plus one new leaf file `frontend/src/components/application/breadcrumbs/breadcrumbs-context.ts`.

## Deletions

Services (each symbol grep-verified unused across frontend/src before removal; now-unused imports cleaned):

- `auth.ts` — signOut, getCurrentUser (+ clearTokens/getUser imports)
- `business-entities.ts` — getBusinessEntityById, createBusinessEntity, updateBusinessEntity, deleteBusinessEntity
- `categories.ts` — getCategoryTree, updateCategory, deleteCategory (CategoryNode import kept — still used by getCategories generic)
- `customers.ts` — getCustomerById
- `orders.ts` — getOrders, getOrderById, updateOrderStatus (+ Order/OrderStatus/DEFAULT_PAGE_SIZE imports)
- `products.ts` — getProductById
- `price-lists.ts` — deletePriceList
- `units.ts` — deleteUnit
- `invoices.ts` — downloadInvoicePdf (+ getAccessToken import)
- `reports.ts` — getProductReportDetails, downloadCustomerDebtXlsx (+ getAccessToken import)

Components — whole files deleted (13; every one had zero external importers, no barrels, no namespace imports, no test references):

`base/input/input-tags.tsx`, `base/input/input-tags-outer.tsx`, `application/app-navigation/sidebar-navigation/sidebar-slim.tsx`, `application/pagination/pagination.tsx`, `application/pagination/pagination-dot.tsx`, `application/pagination/pagination-line.tsx`, `base/avatar/avatar-profile-photo.tsx`, `base/avatar/utils.ts`, `application/activity-feed/activity-feed.tsx`, `application/loading-indicator/loading-indicator.tsx`, `base/select/select-native.tsx`, `application/filter-bar/filter-bar.tsx`, `application/filter-bar/filter-dropdown-menu.tsx`

Components — symbol removals:

- `application/metrics/metrics.tsx` — MetricsSimple, MetricsIcon01–04, MetricsChart01–04 (9 dead exports, ~600 lines) plus internal-only ActionsDropdown / CustomizedDot / lineData constants. **Kept `MetricChangeIndicator`** — imported by `features/dashboard/components/today-stats.tsx`. File is now ~53 lines; stored "split metrics.tsx" XL plan resolved by shrinkage, no further split.
- `base/badges/badges.tsx` — BadgeWithFlag, BadgeWithImage, BadgeWithButton, BadgeIcon (+ Props interfaces; CloseX and FlagTypes imports)
- `base/input/input-date.tsx` — InputDate + InputProps (kept InputDateBase / InputDateBaseProps — used by date-picker components)
- `application/charts/charts-base.tsx` — selectEvenlySpacedItems, ChartActiveDot (+ DotProps import)
- `base/progress-indicators/progress-indicators.tsx` — ProgressBar (kept ProgressBarBase and props exports)
- `base/form/hook-form.tsx` — useFormFieldContext (+ useFormContext/useContext imports)

## Refactors (mechanical, behavior-preserving)

- `base/tags/tags.tsx` — Tag render-prop body extracted to `TagContent` component (context consumed by both; classes unchanged)
- `base/buttons/button-utility.tsx` — body split into `ButtonUtilityContent` (element) + `ButtonUtility` (tooltip wrapper)
- `base/toggle/toggle.tsx` — ToggleBase thumb extracted to `ToggleThumb`
- `application/date-picker/cell.tsx` — derived logic into `useCellState` hook + `getCellClassName` / `getCellContent` curried helpers; JSX and class strings verbatim
- `layout/authenticated-layout.tsx` — contentPad nested ternary → `getContentPad(variant, collapsible, rail)` module helper
- `lib/handle-server-error.ts` — body extracted to `getNoContentMessage` + `getAxiosMessage`; **override order preserved** (204 check first, Axios message wins over it), existing 7-test characterization suite green
- Import cycle `command-menu ↔ context/search-provider` — CommandMenu now takes `open` / `onOpenChange` props; provider owns state + ⌘K shortcut (smallest inversion; provider-renders-CommandMenu direction kept)
- Import cycle `breadcrumbs ↔ breadcrumb-item / breadcrumb-account-item` — BreadcrumbsContext + BreadcrumbType moved to leaf `breadcrumbs-context.ts`; `breadcrumbs.tsx` re-exports `export type { BreadcrumbType }` to preserve its public contract; no external consumers existed (verified)

## Findings that turned out wrong / stale

- `components/ui/chart.tsx` `getPayloadConfigFromPayload` — **already a focused module-level helper** in current code (lines 329–363), called from 3 sites. Nothing to extract; no change made (stale finding).
- `services/auth.ts` signOut — confirmed dead (sign-out dialog wires its own logout call).
- None of the deletion targets was found actually used; no planned deletion was skipped.

## Verification

- `pnpm exec tsc -b` (frontend has **no `typecheck` script** — the plan's `pnpm --filter shadcn-admin typecheck` returns ERR_PNPM_RECURSIVE_RUN_NO_SCRIPT; `tsc -b` is the equivalent used by its build): **zero errors in Package B scope**. Remaining errors are all in `features/**` test files from the concurrent Packages C/D agents (in-flight: missing `await`, unused vars, fixture type mismatches).
- `pnpm exec vitest run --browser.headless src/lib/handle-server-error.test.ts src/context/search-provider.test.tsx src/components/{config-drawer,confirm-dialog,password-input,sign-out-dialog}.test.tsx` — **40/40 pass**.
- `pnpm lint`: the only eslint **errors** (5) are in `features/**` test files (concurrent C/D work — duplicate `@/services/reports` imports, unused vars). 23 warnings are pre-existing react-refresh / TanStack incompatible-library notices in features/routes. Nothing in Package B scope. `guard-design-tokens` clean.
- `git status` limited to my four scope roots: 13 D, 26 M, 1 new file; net −3110 lines.

## Process notes (for the record)

- One incident: an `rm services/reports.ts` was accidentally chained into a read command early on; restored from git immediately (`git checkout --`) with zero residual diff.
- metrics.tsx required a restore-from-git after a corrupted full-file Write, then was completed with verified small edits (sed line-range truncate + targeted Edits); final content re-read and confirmed clean.

## Status

Status: DONE_WITH_CONCERNS
Summary: All Package B deletions, mechanical extracts, and both import-cycle breaks applied and verified (40/40 targeted tests, tsc/eslint/token-guard clean in scope; ~3.1k dead lines removed).
Concerns: (1) remaining tsc/lint errors are features/** test files owned by concurrent Packages C/D and will block the controller's full gate until they finish; (2) plan's frontend typecheck command doesn't exist — use `tsc -b`; (3) ui/chart.tsx refactor was stale, skipped as already done.
