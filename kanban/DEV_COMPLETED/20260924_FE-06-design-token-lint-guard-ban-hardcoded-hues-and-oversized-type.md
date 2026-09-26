---
id: FE-06
title: "Design-token lint guard: ban hardcoded hues + oversized type"
severity: medium
area: design-system
labels: [design-system, tooling, ci]
effort: S
status: dev_completed
column: DEV_COMPLETED
opened: 2026-09-24
started: 2026-09-25
completed: 2026-09-25
---

# FE-06 — Design-token lint guard: ban hardcoded hues + oversized type

**Severity:** medium · **Area:** design-system · **Effort:** S · **Labels:** design-system, tooling, ci

**Trạng thái:** HOÀN THÀNH PHÁT TRIỂN (DEV_COMPLETED)

## Problem

The Fresh Market system requires automated protection against regressing into hardcoded Tailwind palette hues (`bg-emerald-600`, `text-blue-500`) or oversized display typography (`text-2xl+`) outside shadcn base primitives.

## Resolution

1. Added `frontend/scripts/guard-design-tokens.mjs` checking all application source files:
   - Rejects hardcoded palette-numbered colors across `bg-`, `text-`, `border-`, `ring-`, `fill-`, `stroke-` (`slate`, `gray`, `zinc`, `red`, `orange`, `amber`, `yellow`, `green`, `emerald`, `blue`, `indigo`, `purple`, etc.).
   - Rejects `dark:` variants (app is light-only).
   - Rejects oversized typography (`text-xl+` display scale) in app views.
2. Verified gate:
   - Rejected an intentionally violating test fixture with clear line-numbered error output.
   - Passed cleanly across the entire codebase.
3. Chained into `frontend/package.json` under `lint:tokens` and `lint` (`eslint . && pnpm run lint:tokens`).

## Verification

```bash
pnpm --filter shadcn-admin lint:tokens
pnpm --filter shadcn-admin lint
```
