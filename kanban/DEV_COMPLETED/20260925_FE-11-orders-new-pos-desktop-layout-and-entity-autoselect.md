---
id: FE-11
title: "POS / New Order page UI/UX polish: responsive desktop 2-column layout and entity auto-select"
severity: medium
area: frontend
labels: [ui-ux, orders, pos, enhancement]
effort: M
status: dev_completed
column: DEV_COMPLETED
opened: 2026-09-25
started: 2026-09-25
completed: 2026-09-25
---

# FE-11 — POS / New Order page UI/UX polish: responsive desktop 2-column layout and entity auto-select

**Severity:** medium · **Area:** frontend · **Effort:** M · **Labels:** ui-ux, orders, pos, enhancement

**Trạng thái:** HOÀN THÀNH DEV

## Verification Notes
- Refactored `/orders/new` into a responsive desktop 2-column layout (`col-span-8` products/cart on the left, `col-span-4` sticky checkout sidebar on the right).
- Added `useEffect` in `BusinessEntitySelector` to automatically select the business entity when only 1 exists or none is chosen.
- Upgraded business entity selection options into clickable chip badges with active indicator dots.
- Verified via clean production build `tsc -b && vite build`.
- Visually verified via Playwright screenshot (`screenshots/03_orders_new_verified.png`).

## Problem

1. On `/orders/new` (Tạo đơn bán hàng / POS), all sections are vertically stacked in a single full-width column: Business Entity Selector, Customer & Price List, Product Catalog / Line Items, and finally Totals & Checkout CTA. On desktop monitors (1280px-1920px), users must scroll down repeatedly between picking products and checking the total/checkout button.
2. In `frontend/src/features/orders/components/business-entity-selector.tsx`, if the tenant has only 1 business entity (as in most small businesses or default seeds), it is not auto-selected. When the user completes adding products and clicks create, they are stopped with a validation error "Vui lòng chọn đơn vị kinh doanh".

## Evidence

- `frontend/src/features/orders/components/order-create.tsx`: Single `flex flex-col gap-4` container.
- Captured screenshot `screenshots/03_orders_new.png` shows the stretched vertical layout.
- `business-entity-selector.tsx`: `value={selectedEntityId}` without `useEffect` to pick the first entity if `entities.length === 1`.

## Impact

Slow order creation flow, poor desktop ergonomics, unnecessary friction and validation errors during checkout.

## Suggested fix

1. On desktop screens (`lg:` and above), structure the POS view into an ergonomic 2-column layout:
   - Left column (approx 60-65%): Product search, item selection, and line items table with quantity steppers.
   - Right column (approx 35-40%): Sticky summary sidebar containing Business Entity, Customer & Price List selector, payment method, order totals breakdown, and the primary "Tạo đơn hàng" action button.
   - Mobile / tablet retains single-column flow with fixed bottom action bar.
2. Auto-select the business entity if only 1 entity exists or if none is currently selected.
3. Polish all input heights to Fresh Market density (32-36px).
4. Re-capture screenshot for visual QA.
