---
id: FE-07
title: "Products page UI/UX polish: fix NaN stats, wire category & unit columns"
severity: high
area: frontend
labels: [ui-ux, products, bug]
effort: S
status: dev_completed
column: DEV_COMPLETED
opened: 2026-09-25
started: 2026-09-25
completed: 2026-09-25
---

# FE-07 — Products page UI/UX polish: fix NaN stats, wire category & unit columns

**Severity:** high · **Area:** frontend · **Effort:** S · **Labels:** ui-ux, products, bug

**Trạng thái:** HOÀN THÀNH DEV

## Verification Notes
- Fixed `Number(p.purchasePrice || 0)` and `Number(p.defaultSalePrice || 0)` in `features/products/index.tsx`.
- Updated `products-columns.tsx` to read `categoryName` (or `category`) and `unitName` (or `unit`).
- Verified via clean production build `tsc -b && vite build`.
- Visually verified via Playwright screenshot (`screenshots/05_products_verified.png`): "Giá vốn: 596.300 đ", "Giá TB: 41.300 đ", "Nhóm hàng: Banh keo, Do uong...", "ĐVT: Hop, Tui, Thung...".

## Problem

1. On `/products`, the top summary cards display `NaN đ` for "Giá vốn" (inventory value) and "Giá TB" (average price) because `purchasePrice` and `defaultSalePrice` come from the backend as decimal strings (e.g. `"20000.00"`), resulting in string concatenation during `.reduce()` and `NaN` during formatting.
2. In the products table, the "Nhóm hàng" column renders an empty/dash badge and the "ĐVT" (unit) column is completely blank because the column definitions use `accessorKey: 'category'` and `accessorKey: 'unit'`, while the backend returns `categoryName` and `unitName`.
3. The table header view options button renders "View" in English instead of Vietnamese.

## Evidence

- `frontend/src/features/products/index.tsx:38-41`:
  ```ts
  const totalInventoryValue = products.reduce((sum, p) => sum + p.purchasePrice, 0)
  const avgSalePrice = products.length > 0
    ? products.reduce((sum, p) => sum + p.defaultSalePrice, 0) / products.length
    : 0
  ```
- `frontend/src/features/products/components/products-columns.tsx:36,45`:
  `accessorKey: 'category'`, `accessorKey: 'unit'`.
- Captured screenshot `screenshots/05_products.png` shows "Giá vốn: NaN đ", "Giá TB: NaN đ", empty ĐVT.

## Impact

User sees broken math (`NaN đ`) on the main catalog screen and cannot see product units or categories in the table.

## Suggested fix

1. In `features/products/index.tsx`, parse prices with `Number(p.purchasePrice || 0)` and `Number(p.defaultSalePrice || 0)`.
2. In `features/products/components/products-columns.tsx`, update `accessorKey` to `categoryName` and `unitName` with proper fallbacks.
3. Ensure all numbers use `tabular-nums` and format with `formatCurrency()`.
4. Visual QA verification via Playwright screenshot.
