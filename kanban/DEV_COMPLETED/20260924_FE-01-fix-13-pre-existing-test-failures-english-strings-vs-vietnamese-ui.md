---
id: FE-01
title: "Fix 13 pre-existing test failures — English query strings vs Vietnamese UI"
severity: high
area: testing
labels: [testing, i18n]
effort: S
status: dev_completed
column: DEV_COMPLETED
opened: 2026-09-24
started: 2026-09-25
completed: 2026-09-25
---

# FE-01 — Fix 13 pre-existing test failures — English query strings vs Vietnamese UI

**Severity:** high · **Area:** testing · **Effort:** S · **Labels:** testing, i18n

**Trạng thái:** HOÀN THÀNH PHÁT TRIỂN (DEV_COMPLETED)

## Problem

The browser-mode vitest suite had failing tests across 4 files because the tests queried English UI labels while the components render Vietnamese (localization commit fe9a639) and `user-auth-form.test.tsx` was unmocked against the real auth service.

## Resolution

1. Updated UI query strings in `search-provider.test.tsx`, `sign-out-dialog.test.tsx`, and `config-drawer.test.tsx` to match Vietnamese UI labels and exact button text.
2. In `user-auth-form.test.tsx`:
   - Mocked `@/services/auth` with `signInWithEmail` returning a valid auth response so that form submissions succeed cleanly in browser tests.
   - Fixed button locator `getByRole('button', { name: /^Đăng nhập$/ })` to exact regex to prevent collisions with "Đăng nhập bằng Google".
3. Full Vitest suite passes: **10 passed (10 files) | 68 passed (68 tests)**.

## Verification

```bash
pnpm --filter shadcn-admin test
# Output:
# Test Files  10 passed (10)
# Tests       68 passed (68)
# Duration    11.96s
```
