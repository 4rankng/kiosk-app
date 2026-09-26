---
id: FE-09
title: "Price lists UI/UX polish: auto-select default price list and improve guided empty state"
severity: medium
area: frontend
labels: [ui-ux, price-lists, enhancement]
effort: XS
status: dev_completed
column: DEV_COMPLETED
opened: 2026-09-25
started: 2026-09-25
completed: 2026-09-25
---

# FE-09 — Price lists UI/UX polish: auto-select default price list and improve guided empty state

**Severity:** medium · **Area:** frontend · **Effort:** XS · **Labels:** ui-ux, price-lists, enhancement

**Trạng thái:** HOÀN THÀNH DEV

## Verification Notes
- Added auto-selection of the default price list (`isDefault: true` or fallback to `priceLists[0]`) on initial load.
- Added guided empty state with icon and helpful message when no price list is selected.
- Supported `priceLists` prop passing between `PriceLists` and `PriceListSelector` to eliminate duplicate fetches.
- Verified via clean production build `tsc -b && vite build`.
- Visually verified via Playwright screenshot (`screenshots/07_price_lists_verified.png`).

## Problem

1. When navigating to `/price-lists`, `selectedPriceList` starts as `null`. The right-hand content area (75% of the viewport) displays a blank screen or unselected placeholder, forcing the user to make an extra click every single time to see items.
2. The user experience is noticeably empty and disjointed on initial page load.

## Evidence

- `frontend/src/features/price-lists/index.tsx:28`:
  `const [selectedId, setSelectedId] = useState<string | null>(null)`
- Captured screenshot `screenshots/07_price_lists.png` shows the left sidebar with 6 price lists and the right side completely blank.

## Impact

Sub-optimal user experience requiring unnecessary clicks; page appears unfinished or slow on load.

## Suggested fix

1. In `features/price-lists/index.tsx`, when data loads and `selectedId` is null, automatically set `selectedId` to the price list with `isDefault: true`, or fallback to `priceLists[0]?.id`.
2. Provide a clean, friendly empty state with icon and helpful message ("Chọn một bảng giá để xem chi tiết hoặc thêm sản phẩm") when no list exists or is selected.
3. Re-capture screenshot for visual QA.
