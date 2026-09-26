---
id: FE-03
title: "Finish density sweep on remaining surfaces"
severity: medium
area: design-system
labels: [design-system, polish]
effort: M
status: dev_completed
column: DEV_COMPLETED
opened: 2026-09-24
started: 2026-09-25
completed: 2026-09-25
---

# FE-03 — Finish density sweep on the remaining surfaces

**Severity:** medium · **Area:** design-system · **Effort:** M · **Labels:** design-system, polish

**Trạng thái:** HOÀN THÀNH PHÁT TRIỂN (DEV_COMPLETED)

## Problem

Outliers and inconsistencies remained on surfaces not covered in initial passes: reports drill-down sub-tables, mobile report cards, price-lists tables, products, companies. Specifically, missing `tabular-nums` for right-aligned currency and numeric columns, and usage of non-token color classes (`text-destructive` vs amber `--warning` for debt).

## Resolution

1. **Price Lists Surface:**
   - Added `tabular-nums` to base price cells and mobile price list cards.
   - Preserved `NumberInput` compact 32px height.
2. **Product Reports Surface:**
   - Right-aligned `Số lượng`, `Giá bán`, and `Thành tiền` in consumption history sub-table with explicit column widths.
   - Added `tabular-nums` and `formatNumber` to quantity and price details in both desktop table and mobile card view.
3. **Customer Reports Surface:**
   - Switched debt highlight in mobile card view from `text-destructive` to project standard amber `--warning`.
   - Added `tabular-nums` to all revenue and unpaid amount metrics.
4. Clean compile: `tsc -b && vite build` passes in ~300ms.

## Verification

```bash
pnpm --filter shadcn-admin build
```

---

## [2026-09-25] DEV COMPLETED (lane 2 sweep evidence)

- Reports: `text-amber-600 dark:text-amber-400` / `text-emerald-700 dark:...`
  → `text-warning` / `text-success` across reports/customers + reports/products
  (cards, tables, icons); `dark:` stripped.
- `invoices-columns.tsx` amber action button → `text-warning hover:bg-warning/10`.
- `invoices/status-meta.ts` (5-status rewrite): re-tokenized to
  success/warning/destructive/muted, light-only.
- `text-2xl`/`text-xl` → `text-display`/`text-lg` in products, auth, orders,
  reports (8 files).
- Gate: guard-design-tokens clean; `pnpm build` green; vitest 68/68.
