# Tech-Debt Pass — repowise findings (2026-09-27)

Execute the full repowise-reported debt inventory: dead code, mechanical refactors,
DRY/structural refactors, and characterization tests for untested hotspots.
Controller session (kiosk-app-02) commits and pushes; agents do NOT commit.

## Ground rules (all agents)

- Baseline commit `ffc5f56`, tree clean except user's untracked config dirs — leave `.gitignore`, `.claude/`, `.codex/`, `.mcp.json`, `.vscode/`, `AGENTS.md`, `plans/` untouched.
- Behavior-preserving changes only. No UI copy changes (Vietnamese-first copy stays), no visual changes, no new dependencies, no config changes.
- Verify every deletion with `grep -rn "<Symbol>" <scope>` before removing (catches barrel re-exports and dynamic usage).
- Tests-first for any file being refactored: write the characterization test, run it against current behavior, then refactor, then re-run.
- Frontend tests: vitest **browser mode** (`vitest-browser-react`), mirror conventions from `frontend/src/components/confirm-dialog.test.tsx` and `frontend/src/lib/handle-server-error.test.ts`. Run only targeted files: `cd frontend && pnpm exec vitest run --browser.headless <paths>`.
- Backend tests: node vitest, DB-free with mocked db client — mirror `backend/src/modules/auth/auth.service.test.ts`. Run `cd backend && pnpm exec vitest run <paths>`.
- Typecheck per workspace: `pnpm --filter shadcn-admin typecheck` / `pnpm --filter kiosk-backend typecheck`.
- If a characterization test cannot be made deterministic, test the extracted pure helper instead and note it in the report.
- End with `Status: DONE | DONE_WITH_CONCERNS | BLOCKED`, one-paragraph summary, and concerns. Write a short report to `plans/reports/{agent}-260927-1658-tech-debt.md`.

## Package A — backend (owns `backend/**`)

Deletions:
- `backend/src/lib/response.ts` — remove export `noContent` (lines 23-25), then its import in that file if now unused.
- `backend/src/lib/errors.ts` — remove export `Unprocessable` (lines 29-30).
- `backend/src/lib/sanitize.ts` — DELETE the whole file (file unreachable, `sanitizeObject` unused).

Refactors:
- `backend/src/db/create-admin.ts` — extract `parseArgs` body (lines 21-52, CCN-heavy) into a named helper; keep behavior identical (it's the `admin:create` script entry).
- `backend/src/modules/orders/orders.service.ts` — extract `list` method body (lines 83-139) into private helpers; de-duplicate lines 185-192, which clone 28 lines shared with `backend/src/modules/products/products.service.ts` — extract the shared block into one helper both services use (new `backend/src/lib/` helper or shared private util; keep it small, KISS).
- `backend/src/modules/reports/reports.service.ts` — extract the `getDashboard` body (lines 113-246) into focused private methods (one per dashboard aggregate).
- `backend/src/modules/auth/auth.service.ts` — extract from `register` (lines 186-229) into private helpers (e.g. password hashing / user creation steps).

Tests:
- New characterization tests for `orders.service.ts` and `reports.service.ts` (mock the db module the same way existing backend tests do). Validate against pre-refactor behavior, then refactor, then re-run.
- Run the existing backend suite to confirm no regressions: `cd backend && pnpm exec vitest run`.

## Package B — frontend lib/components/services (owns `frontend/src/components/**`, `frontend/src/services/**`, `frontend/src/lib/handle-server-error.ts`, `frontend/src/context/search-provider.tsx`)

Deletions (verify with grep, then remove; clean up now-unused imports in each file):
- `components/application/metrics/metrics.tsx`: `MetricsSimple`, `MetricsIcon01`–`04`, `MetricsChart01`–`04` (9 exports, ~528 lines). Afterward re-check the file's size/health; the stored XL "split metrics.tsx" plan is considered resolved if the remaining file is small — do NOT split further.
- `components/base/badges/badges.tsx`: `BadgeWithFlag`, `BadgeWithImage`, `BadgeWithButton`, `BadgeIcon`.
- `components/base/input/input-date.tsx`: `InputDate`.
- `components/base/input/input-tags.tsx`: `InputTags` — if the file then has no used export, delete the file.
- `components/base/input/input-tags-outer.tsx`: `InputTagsOuter` — same rule.
- `components/application/app-navigation/sidebar-navigation/sidebar-slim.tsx`: `SidebarNavigationSlim` — same rule.
- `components/application/pagination/` : in `pagination.tsx` remove `PaginationPageDefault`, `PaginationPageMinimalCenter`, `PaginationCardDefault`, `PaginationCardMinimal`, `PaginationButtonGroup`, `PaginationCardAdvanced`; in `pagination-dot.tsx` remove `PaginationDot`; in `pagination-line.tsx` remove `PaginationLine`. If a file keeps no used export, delete the file (report which).
- `components/base/avatar/avatar-profile-photo.tsx`: `AvatarProfilePhoto` — same rule. `components/base/avatar/utils.ts`: `getInitials` — same rule.
- `components/application/activity-feed/activity-feed.tsx`: `FeedItem` — same rule.
- `components/application/loading-indicator/loading-indicator.tsx`: `LoadingIndicator` — same rule.
- `components/base/select/select-native.tsx`: `NativeSelect` — same rule.
- `components/application/filter-bar/filter-bar.tsx`: `FilterBar`; `components/application/filter-bar/filter-dropdown-menu.tsx`: `FilterDropdown` — same rule per file.
- `components/application/charts/charts-base.tsx`: `selectEvenlySpacedItems`, `ChartActiveDot` — same rule.
- `components/base/progress-indicators/progress-indicators.tsx`: `ProgressBar`.
- `components/base/form/hook-form.tsx`: `useFormFieldContext`.
- `services/reports.ts`: `downloadCustomerDebtXlsx`, `getProductReportDetails`.
- `services/invoices.ts`: `downloadInvoicePdf`.
- `services/auth.ts`: `signOut`, `getCurrentUser` (verified: only `signInWithEmail` is imported anywhere; sign-out dialog has its own wiring).
- `services/business-entities.ts`: `getBusinessEntityById`, `createBusinessEntity`, `updateBusinessEntity`, `deleteBusinessEntity`.
- `services/categories.ts`: `getCategoryTree`, `updateCategory`, `deleteCategory`.
- `services/customers.ts`: `getCustomerById`.
- `services/orders.ts`: `getOrders`, `getOrderById`, `updateOrderStatus` (verified unused).
- `services/products.ts`: `getProductById`.
- `services/price-lists.ts`: `deletePriceList`.
- `services/units.ts`: `deleteUnit`.

Refactors:
- `components/base/tags/tags.tsx` — extract `Tag` body (113-183) into helper component(s).
- `components/application/date-picker/cell.tsx` — extract `CalendarCell` body (15-108).
- `components/base/buttons/button-utility.tsx` — extract `ButtonUtility` body (53-117).
- `components/base/toggle/toggle.tsx` — extract `ToggleBase` body (16-74).
- `components/ui/chart.tsx` — extract `getPayloadConfigFromPayload` (329-363) into a focused helper.
- `components/layout/authenticated-layout.tsx` — extract `Shell` body (12-57).
- `lib/handle-server-error.ts` — extract `handleServerError` body (4-29) into helpers; existing test `lib/handle-server-error.test.ts` must stay green.
- Break import cycle: `components/command-menu.tsx` ↔ `context/search-provider.tsx` (invert the dependency; smallest change that breaks the cycle).
- Break import cycle: `components/application/breadcrumbs/breadcrumbs.tsx` ↔ `breadcrumb-account-item.tsx` / `breadcrumb-item.tsx`.

## Package C — features east (owns `frontend/src/features/{orders,products,price-lists,reports}/**`)

Tests first (characterization; mock the service layer, assert current user-visible behavior — money formatting, statuses, empty/loading states, key actions):
- `features/orders/components/order-create.tsx` (highest-debt file in repo)
- `features/price-lists/components/price-list-table.tsx`
- `features/reports/customers/index.tsx`
- `features/reports/products/index.tsx` and `components/product-report-table.tsx`
- `features/products/index.tsx`, `components/products-table.tsx`

Refactors (each after its test where one exists):
- `features/orders/components/order-line-item.tsx` — extract helper (17-24, DRY clone shared across files).
- `features/orders/components/customer-selector.tsx` — extract helper (31-51) and split the 162-line component into focused pieces.
- `features/products/components/product-mutate-dialog.tsx` — extract from `ProductMutateDialog` (19-184) into focused pieces (e.g. form sections / submit handler).
- `features/products/components/products-mobile-list.tsx` — extract from `ProductsMobileList` (13-95).
- `features/price-lists/components/price-list-table.tsx` — extract `PriceListTable` body (18-133) and `MobilePriceList` (136-215) into child components/helpers.
- `features/reports/customers/index.tsx` — extract helpers (43-55 and 121-141; DRY with sibling report pages).

## Package D — features west (owns `frontend/src/features/{customers,companies,invoices,dashboard}/**`)

Tests first (same conventions):
- `features/customers/components/customers-table.tsx`
- `features/companies/components/companies-table.tsx` and `company-mutate-dialog.tsx`
- `features/invoices/components/invoices-table.tsx`, `invoices-columns.tsx`, `payment-dialog.tsx` (payment-dialog has recent bug history — regression-test the fix areas)
- `features/dashboard/components/today-stats.tsx`, `outstanding-debts.tsx`, `top-products.tsx`, `top-customers.tsx`, `monthly-revenue-chart.tsx`

Refactors (each after its test):
- `features/customers/components/customer-mutate-dialog.tsx` — extract from `CustomerMutateDialog` (17-145).
- `features/companies/components/company-mutate-dialog.tsx` — extract (17-113) and de-duplicate the 28-97/99-113 clone blocks shared with sibling dialogs.
- `features/dashboard/components/recent-invoices.tsx` — extract helper (96-105).
- `features/dashboard/components/monthly-revenue-chart.tsx` — extract helper (36-50, DRY across chart components).
- `features/dashboard/components/today-stats.tsx` — extract from `TodayStats` (46-136).

## Controller commit plan (after agents finish)

1. `chore(cleanup): remove unused exports and unreachable files`
2. `refactor(backend): extract service helpers and de-duplicate orders/products clone`
3. `refactor(ui): mechanical extractions and import-cycle breaks`
4. `test: characterization coverage for hotspot features` (plus feature refactors — may split into two commits by staging area)
Then `git push` to main. Full-gate before each commit: `pnpm typecheck && pnpm lint && pnpm test`.
