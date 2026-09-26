---
id: FE-08
title: "Invoices table UI/UX polish: full status badge with text, fix paid calculation, localize view options"
severity: high
area: frontend
labels: [ui-ux, invoices, bug, i18n]
effort: S
status: dev_completed
column: DEV_COMPLETED
opened: 2026-09-25
started: 2026-09-25
completed: 2026-09-25
---

# FE-08 — Invoices table UI/UX polish: full status badge with text, fix paid calculation, localize view options

**Severity:** high · **Area:** frontend · **Effort:** S · **Labels:** ui-ux, invoices, bug, i18n

**Trạng thái:** HOÀN THÀNH DEV

## Verification Notes
- Backend: added `isPaid` computation in `backend/src/modules/invoices/invoices.service.ts` (`list` and `getById`).
- Frontend: computed `isPaid` and `partiallyPaid` in `invoices-columns.tsx`.
- Updated `status-meta.ts` with distinct badges and soft Fresh Market palette: Đã thanh toán (emerald), Thanh toán 1 phần (amber), Chưa thanh toán (rose), Đang xử lý (amber), Đã hủy (slate).
- Localized `view-options.tsx` to Vietnamese ("Hiển thị", "Bật/tắt cột", and column labels).
- Actions: conditionally render "Thu tiền" ($) only for unpaid or partially paid invoices.
- Verified via clean production build `tsc -b && vite build`.
- Visually verified via Playwright screenshot (`screenshots/04_invoices_verified.png`).

## Problem

1. On `/invoices`, invoice status is rendered as a standalone icon inside a tooltip with no visible text label. Users cannot quickly scan invoice statuses across rows without hovering.
2. In `frontend/src/features/invoices/components/invoices-columns.tsx`, the payment status logic checks `invoice.isPaid`. However, the backend `/api/invoices` returns `total` and `paidAmount` without `isPaid`. As a result, `invoice.isPaid` is `undefined`, causing all completed/fully paid invoices to show as unpaid (destructive red badge/icon).
3. The shared table component `frontend/src/components/data-table/view-options.tsx` contains hardcoded English strings: "View" for the dropdown trigger button and "Toggle columns" for the dropdown label.

## Evidence

- `frontend/src/features/invoices/components/invoices-columns.tsx:28-66`:
  Tooltip with icon only, checking `row.original.isPaid`.
- `frontend/src/components/data-table/view-options.tsx:29, 34`:
  `<Button ...>View</Button>`, `<DropdownMenuLabel>Toggle columns</DropdownMenuLabel>`.
- Captured screenshot `screenshots/04_invoices.png` shows red alert icon on all rows, including HD0001 (1.485.000đ fully paid).

## Impact

Accountants and cashiers see false unpaid status warnings across all invoices, and English strings leak on every data table view menu.

## Suggested fix

1. In `features/invoices/components/invoices-columns.tsx`, compute `isPaid`:
   `const isPaid = Number(invoice.paidAmount || 0) >= Number(invoice.total || 0)`
2. Render a full Fresh Market badge with both icon and Vietnamese text:
   - Đã thanh toán (`bg-emerald-50 text-emerald-700 border-emerald-200`)
   - Thanh toán 1 phần (`bg-amber-50 text-amber-700 border-amber-200`)
   - Chưa thanh toán (`bg-rose-50 text-rose-700 border-rose-200`)
   - Đã hủy (`bg-slate-50 text-slate-600 border-slate-200`)
3. In `components/data-table/view-options.tsx`, translate "View" to "Hiển thị" and "Toggle columns" to "Bật/tắt cột".
4. Re-capture screenshot for visual QA verification.
