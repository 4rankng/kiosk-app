# Package C — features east (tech-debt pass 260927)

Agent: fe-features-east · Scope: `frontend/src/features/{orders,products,price-lists,reports}/**`

## Result

Status: DONE (with notes). All 6 listed refactors applied, 7 characterization test files written first
and green against current behavior before refactoring, re-run green after. Final Package C suite:
**7 files / 24 tests, all passing** (`cd frontend && pnpm exec vitest run --browser.headless src/features/orders src/features/products src/features/price-lists src/features/reports`).
Frontend typecheck passes (`tsc -b`, 0 errors). ESLint on the scope: 0 errors, 5 warnings — all
pre-existing patterns (baseline HEAD had 7 warnings; net −2).

## Tests written (characterization, vitest-browser-react, service layer mocked via vi.mock + vi.hoisted)

- `features/orders/components/order-create.test.tsx` (4) — page title/sections, submit validation toasts (no customer / no items), full happy path: customer select → add products → business-entity auto-select → createOrder payload → success dialog with order code.
- `features/price-lists/components/price-list-table.test.tsx` (4) — row render + vi-VN money, search filter + empty row, save payload + success toast, edited custom price propagation.
- `features/reports/customers/index.test.tsx` (4) — loading (button disabled, no content), empty state, KPI summary + grouped totals, filter-button refetch with same args.
- `features/reports/products/index.test.tsx` (2) — empty state, KPI summary + expandable product table.
- `features/reports/products/components/product-report-table.test.tsx` (3) — row money/quantity, expand/collapse details, empty row.
- `features/products/index.test.tsx` (3) — summary stats (counts + formatted money), edit dialog opens prefilled from row menu, delete confirmation copy.
- `features/products/components/products-table.test.tsx` (4) — row render, loading → data transition, error + retry refetch, search filter + empty.

Conventions: chrome (`Header`, `Search`, `ProfileDropdown`, `Breadcrumbs`) is mocked in page-level
tests only; viewport is desktop (1280) so `useIsMobile()` is false — mobile branches not DOM-tested
(noted below). vi-VN formatting asserted via exact strings ('125.000 đ', '1.250').

## Refactors (behavior-preserving)

- `orders/components/order-line-item.tsx` — extracted `LineItemHeader` (name/unit + total row).
- `orders/components/customer-selector.tsx` — extracted `useCustomerReferenceData` hook (company + price-list queries) and split into `CustomerSummary` / `CustomerDesktopSearch` / `CustomerMobileSheet`.
- `products/components/product-mutate-dialog.tsx` — extracted `getProductFormDefaults`, `buildProductPayload`, and `ProductFormFields` (new `product-form-fields.tsx`); dialog keeps shell + mutation.
- `products/components/products-mobile-list.tsx` — extracted `useIncrementalVisible` hook + `ProductMobileRow`.
- `price-lists/components/price-list-table.tsx` — extracted `PriceListDesktopTable` child; `MobilePriceList` moved to new `price-list-mobile.tsx` (renamed `PriceListMobile`) with its own `useIncrementalVisible` (kept the two hooks per-file rather than a cross-feature import; identical logic, KISS).
- `reports/customers/index.tsx` + `reports/products/index.tsx` — extracted pure `summarizeCustomerReport` / `summarizeProductReport` and per-page KPI components on a new shared `reports/components/report-kpi-card.tsx` (`ReportKpiCard` with label/value/icon tone props preserving exact original classes, incl. tinted third-card labels).

## Findings worth knowing

1. **Deterministic quirk characterized (not fixed)**: in `CustomerSelector`, `handleSelect` captures `priceList?.id` at click time, but the by-company price-list query is disabled until a customer is selected — so the FIRST selection always passes `priceListId: ''` and products price from `defaultSalePrice`; only a re-selection (warm cache) uses the price list. The order-create test pins both paths. Flagging as a possible real bug for product owners (fresh-session orders priced from defaults).
2. **Product report quantity cell** renders the raw number (`1250`), while the KPI card uses `toLocaleString('vi-VN')` and details use `formatNumber` — pinned as-is in tests; possible inconsistency to align later.
3. Plan command `pnpm --filter shadcn-admin typecheck` does not exist (frontend has no typecheck script); used the build script's step `cd frontend && pnpm exec tsc -b` instead — passes.
4. Vitest browser-mode port: a long-running vitest browser server from the `chatbot` project intermittently holds the default port, causing sporadic "Port 63315 is already in use" run failures — re-running succeeds. Did not kill it (not ours). Consider making browser API port configurable per project.
5. `frontend/.vitest-attachments/*.png` — failure screenshots produced by browser-mode test failures during iteration (mine; possibly other agents' too). Left in place; safe to delete before commit.
6. Mobile branches (`PriceListMobile`, `ProductsMobileList`, report mobile tables) are typechecked and exercised by the shared logic but not DOM-tested (fixed desktop viewport in browser config).
7. Vietnamese copy, visual output, and deps unchanged; no files outside the four feature folders touched (screenshot artifact dirs created by failed runs were removed).
