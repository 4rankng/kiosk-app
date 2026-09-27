# Package D — features west (customers, companies, invoices, dashboard)

Agent: fe-features-west · 2026-09-27 · Status: DONE_WITH_CONCERNS (see notes)

## Characterization tests (all written first, verified against pre-refactor behavior, re-run after refactor)

14 files, 66 tests, all passing (`cd frontend && pnpm exec vitest run --browser.headless src/features/customers src/features/companies src/features/invoices src/features/dashboard`):

- `features/customers/components/customers-table.test.tsx` — loading skeleton (8 pulse rows), error + Thử lại reload, row content (code/name/phone/MST + action buttons), empty cell, search filter
- `features/customers/components/customer-mutate-dialog.test.tsx` — add/edit titles, zod validation messages (only the ones actually rendered), create/update payloads, invalidation of ['customers'], cancel closes
- `features/companies/components/companies-table.test.tsx` — loading, error+retry, Đã gán/Chưa gán badges, empty
- `features/companies/components/company-mutate-dialog.test.tsx` — add/edit, create payload with null address/email/phone, update payload, cancel
- `features/invoices/components/invoices-table.test.tsx` — loading/error/empty, legend + per-status badges, search filter
- `features/invoices/components/invoices-columns.test.tsx` — statusMeta outcomes (Đã thanh toán / Thanh toán 1 phần / Chưa thanh toán / Đang xử lý / Đã hủy), print vs Thu tiền action visibility per paid/cancelled state, context probe on Thu tiền click, formatCurrency/formatDateTime
- `features/invoices/components/payment-dialog.test.tsx` — renders nothing with no invoice, Tổng/Đã thanh toán/Còn lại amounts, markInvoiceAsPaid(invoice.id), invalidates ['invoices'] AND ['dashboard-stats'] (bug-fix regression area), failure keeps dialog open
- `features/dashboard/components/today-stats.test.tsx` (+ pure helper tests) — 4 cards, vi-VN money, +25.0% / +2 trends, 80.0% tỷ lệ thu, khách nợ count, muted '— 0' zero-baseline, error/loading
- `features/dashboard/components/outstanding-debts.test.tsx` — skeleton, error, empty, rows + Tổng công nợ
- `features/dashboard/components/top-products.test.tsx` — skeleton, error, empty, qty+unit
- `features/dashboard/components/top-customers.test.tsx` — skeleton, error, empty, rank/revenue
- `features/dashboard/components/recent-invoices.test.tsx` — skeleton, error, empty, per-status badges, cancelled row opacity, vi-VN time
- `features/dashboard/components/monthly-revenue-chart.test.tsx` — skeleton, error, all-zero empty state
- `features/dashboard/components/monthly-revenue-chart-data.test.ts` — pure `buildRevenueChartData` mapping + hasRevenue logic

## Refactors applied (behavior-preserving, verified by the tests above)

- `customer-mutate-dialog.tsx` — extracted `CustomerFormFields`; header/footer now use shared `MutateDialogHeader`/`MutateDialogFooter`
- `company-mutate-dialog.tsx` — extracted `CompanyFormFields`; shares the same header/footer parts → the clone blocks shared with the customer dialog are de-duplicated in `features/companies/components/mutate-dialog-parts.tsx` (new file; customers imports it across the two related feature folders — closest available home given folder-ownership constraints, mirrors the features/reports shared-table precedent)
- `recent-invoices.tsx` — extracted `RecentInvoiceRow` + pure `formatInvoiceTime`
- `monthly-revenue-chart.tsx` — extracted exported pure `buildRevenueChartData` + `ChartEmptyState`
- `today-stats.tsx` — extracted exported pure `computeTodayStatsSummary`, `statSubtitle`, `StatCard`; TodayStats body is now query + 3 state branches

## Notes / deviations

1. Nondeterministic DOM case: the monthly-revenue-chart **with-data** path lazy-loads a recharts chunk that is not stable under the browser runner (vite dep-optimizer reload mid-test → "Invalid hook call"; re-ran once per protocol, still fails). Per plan ground rules I test the extracted pure helper (`buildRevenueChartData`) instead and dropped that single DOM assertion.
2. `pnpm --filter shadcn-admin typecheck` does not exist (frontend has no typecheck script); used `tsc -b` in frontend (the typecheck half of `build`) — Package D files are clean. Remaining repo errors: 2 pre-existing ones in `features/price-lists/components/price-list-table.test.tsx` (Package C's file, not touched).
3. Concurrent vitest browser runs (other agents / other projects) collide on the shared default browser port 63315; my runs retry on "port already in use". Test results unaffected.
4. Characterization-test findings: the customer dialog renders visible zod errors only for code/name/companyId/email (phone/address have no error paragraph) — asserted as-is, current behavior preserved. Payment mutation receives a second react-query context argument, asserted with `expect.anything()`.
5. Vietnamese copy, visuals, deps untouched; no commits made.
