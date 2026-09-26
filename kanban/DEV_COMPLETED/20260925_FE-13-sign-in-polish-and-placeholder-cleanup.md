---
id: FE-13
title: "Sign-in UI/UX polish: update placeholder to TingTing domain and adhere to Fresh Market control sizing"
severity: low
area: frontend
labels: [ui-ux, auth, polish]
effort: XS
status: dev_completed
column: DEV_COMPLETED
opened: 2026-09-25
started: 2026-09-25
completed: 2026-09-25
---

# FE-13 — Sign-in UI/UX polish: update placeholder to TingTing domain and adhere to Fresh Market control sizing

**Severity:** low · **Area:** frontend · **Effort:** XS · **Labels:** ui-ux, auth, polish

**Trạng thái:** HOÀN THÀNH DEV

## Verification Notes
- Updated default credentials and email placeholder to `admin@tingting.vn`.
- Refined input fields and submit button heights from bulky `h-11` to Fresh Market `h-9` scale.
- Verified via clean production build `tsc -b && vite build`.
- Visually verified via Playwright screenshot (`screenshots/01_sign_in_verified.png`).

## Problem

1. In `frontend/src/features/auth/sign-in/components/user-auth-form.tsx`, the placeholder and default value use `admin@phuonglinh.vn` instead of `admin@tingting.vn`.
2. Input controls and buttons use oversized `h-11` (44px) instead of the Fresh Market control scale (36-40px on login forms).

## Evidence

- `frontend/src/features/auth/sign-in/components/user-auth-form.tsx:38, 121`:
  `defaultValues: { email: 'admin@phuonglinh.vn', ... }`
  `placeholder='admin@phuonglinh.vn'`
- Captured screenshot `screenshots/01_sign_in.png`.

## Impact

Brand inconsistency with TingTing platform and slightly oversized input controls compared to the design standard.

## Suggested fix

1. Update default values and placeholders in `user-auth-form.tsx` to `admin@tingting.vn`.
2. Standardize inputs and buttons to `h-9` or `h-10` with soft Fresh Market styling.
3. Verify with screenshot.
