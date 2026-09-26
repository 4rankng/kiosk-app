---
id: FE-10
title: "Reports pages UI/UX polish: auto-fetch default date range and enhance presentation"
severity: medium
area: frontend
labels: [ui-ux, reports, enhancement]
effort: S
status: dev_completed
column: DEV_COMPLETED
opened: 2026-09-25
started: 2026-09-25
completed: 2026-09-25
---

# FE-10 — Reports pages UI/UX polish: auto-fetch default date range and enhance presentation

**Severity:** medium · **Area:** frontend · **Effort:** S · **Labels:** ui-ux, reports, enhancement

**Trạng thái:** HOÀN THÀNH DEV

## Verification Notes
- Fixed `dateRange` in `reports.service.ts` to prevent duplicate `T23:59:59` causing `Invalid Date` queries.
- Enabled auto-query on mount with initial date range for both Customer Report and Product Report.
- Added KPI summary metric cards (Khách hàng, Tổng tiền hàng, Công nợ chưa thu / Số mặt hàng, Số lượng bán, Doanh thu).
- Added structured empty states with iconography when no data exists in range.
- Dense styling and `tabular-nums` alignment on all table figures and subtotals.
- Verified via clean production build `tsc -b && vite build`.
- Visually verified via Playwright screenshots (`09_reports_customers_populated.png`, `10_reports_products_populated.png`).

## Problem

1. On `/reports/customers` and `/reports/products`, the query is guarded by `enabled: fetchKey > 0`, where `fetchKey` is initialized to 0. When users open either report page, the entire screen below the date filter bar is blank. Users have to explicitly find and click "Xem báo cáo" to see any data at all.
2. The initial state looks like a broken or blank page rather than an active analytics view.

## Evidence

- `frontend/src/features/reports/customers/index.tsx`:
  `const [fetchKey, setFetchKey] = useState(0)`
  `useQuery({ ... enabled: fetchKey > 0 })`
- `frontend/src/features/reports/products/index.tsx`:
  Same `fetchKey = 0` pattern.
- Captured screenshots `screenshots/09_reports_customers.png` and `screenshots/10_reports_products.png` show empty white space below the filter controls.

## Impact

First impression of the reports module is empty/broken. Extra click required every time.

## Suggested fix

1. Enable the query on mount with the default date range (`startOfMonth` to `endOfMonth` or 30 days) so that the user immediately sees charts and figures.
2. Ensure summary metrics cards (Doanh thu, Công nợ, Số lượng) are displayed with Fresh Market styling, soft borders, and `tabular-nums`.
3. Provide a clear empty state if no transactions exist in the selected period.
4. Re-capture screenshots for visual QA.
