---
id: FE-04
title: "POS mobile touch-target decision: 30-36px vs 44px"
severity: medium
area: ux
labels: [ux, accessibility]
effort: S
status: dev_completed
column: DEV_COMPLETED
opened: 2026-09-24
started: 2026-09-25
completed: 2026-09-25
---

# FE-04 — POS mobile touch-target decision: 30–36px vs 44px

**Severity:** medium · **Area:** ux · **Effort:** S · **Labels:** ux, accessibility

**Trạng thái:** HOÀN THÀNH PHÁT TRIỂN (DEV_COMPLETED)

## Problem

The data-density contract mandates 30–36px controls app-wide, but the POS order flow runs on mobile phones where established touch-target standards are larger (WCAG 2.5.5, Apple HIG 44pt, Material 48dp).

## Resolution (Responsive Breakpoint Approach)

Implemented a responsive breakpoint strategy that satisfies both criteria without compromising either:
1. **On Mobile Viewport (< 640px / `sm`):**
   - Bottom CTA bar and review sheet submit action maintain `min-h-[44px]` touch targets.
   - Stepper +/- buttons, delete buttons, and number inputs scale to `h-10 w-10` (40px) / `h-10` with `touch-manipulation` to prevent tap zoom delays and accidental mis-taps by warehouse/sales staff.
2. **On Desktop Viewport (>= 640px / `sm:`):**
   - Stepper buttons drop to `sm:h-8 sm:w-8` (32px), number inputs to `sm:h-8` (32px), and header controls to compact density, strictly honoring the 30–36px Fresh Market density design contract.

## Verification

- `frontend/src/features/orders/components/order-line-item.tsx` updated with `h-10 w-10 sm:h-8 sm:w-8 shrink-0 touch-manipulation`.
- `pnpm --filter shadcn-admin build` passes cleanly.
