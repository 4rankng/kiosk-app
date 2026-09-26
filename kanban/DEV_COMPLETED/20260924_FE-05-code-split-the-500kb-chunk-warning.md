---
id: FE-05
title: "Code-split the 500kB+ chunk (route-level lazy loading)"
severity: low
area: performance
labels: [performance, compile]
effort: M
status: dev_completed
column: DEV_COMPLETED
opened: 2026-09-24
started: 2026-09-25
completed: 2026-09-25
---

# FE-05 — Code-split the 500kB+ chunk (route-level lazy loading)

**Severity:** low · **Area:** performance · **Effort:** M · **Labels:** performance, compile

**Trạng thái:** HOÀN THÀNH PHÁT TRIỂN (DEV_COMPLETED)

## Problem

Vite bundles emitted deprecation warnings on `advancedChunks` and risk chunk size ballooning over 500kB without dedicated vendor isolation for heavy modules (`xlsx`, `recharts`, TanStack, React).

## Resolution

1. Migrated `frontend/vite.config.ts` from deprecated `advancedChunks` to Rolldown/Vite 8 `codeSplitting.groups`.
2. Structured explicit vendor isolation chunks:
   - `vendor-react` (`react`, `react-dom`, `scheduler`) ~189 kB
   - `vendor-tanstack` (`@tanstack/*`) ~169 kB
   - `vendor-recharts` (`recharts`, `d3-*`) ~336 kB
   - `vendor-xlsx` (`xlsx`) ~424 kB
3. Zero deprecation warnings on build (`✓ built in 462ms`). No chunk exceeds 500kB. All unit tests pass cleanly.

## Verification

```bash
pnpm --filter shadcn-admin build
pnpm --filter shadcn-admin test
```
