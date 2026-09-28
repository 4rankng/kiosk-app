---
id: BE-01
title: "Pin the dev toolchain against drizzle-kit's stale esbuild (3 moderate advisories remain)"
severity: low
area: backend
labels: [tech-debt, security, dependencies]
effort: S
status: todo
column: TODO
opened: 2026-09-28
---

# BE-01 — Pin the dev toolchain against drizzle-kit's stale esbuild

**Severity:** low · **Area:** backend · **Effort:** S · **Labels:** tech-debt, security, dependencies

**Trạng thái:** TODO

## Context

A dependency sweep on 2026-09-28 took the workspace from **43 advisories (including critical)**
to **3 moderate**. The critical one (Vitest UI server arbitrary file read) and all 17 highs are
resolved. What is left:

| Module | Severity | Path | Why it is still here |
|---|---|---|---|
| `esbuild` ≤0.24.2 | moderate | `backend > drizzle-kit > @esbuild-kit/esm-loader > esbuild` | The fix is `>=0.25.0`; no patched release exists in the `0.18`–`0.24` line that `@esbuild-kit` depends on. Forcing a major would likely break drizzle-kit. |
| `uuid` <11.1.1 | moderate | `backend > exceljs` | The advisory is specific to `v3`/`v5`/`v6` **when a `buf` argument is supplied**. ExcelJS uses `v4`, which is unaffected. The fix is a major bump to `>=11.1.1`. |

Neither ships to production: `drizzle-kit` is a local migration CLI, and the `uuid` path is not
reached by this app's usage.

## Why it stays open

A `pnpm.overrides` entry that force-majors `esbuild` through `@esbuild-kit` is a real risk of
breaking `db:generate`/`db:push` for a moderate advisory that only affects a local dev server.
Recorded rather than forced.

## Options

1. Revisit when `drizzle-kit` bumps its `@esbuild-kit` dependency (check on the next kit upgrade).
2. Track upstream `@esbuild-kit/core-utils` for a release that lifts the esbuild floor.
3. Accept and re-audit each quarter.

## Verification Notes

- Re-check with `pnpm audit` after any drizzle-kit upgrade.
- Confirm the migration path still works: `cd backend && pnpm db:generate` and `db:push`.
