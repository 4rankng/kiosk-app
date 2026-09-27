# Package A — backend tech-debt pass (2026-09-27)

Baseline: commit ffc5f56. Agent: backend-debt. All changes confined to `backend/**`. Nothing committed.

## Deletions (all grep-verified unused before removal)

- `backend/src/lib/response.ts` — removed `noContent` (only reference was its own definition + stale `backend/dist` output).
- `backend/src/lib/errors.ts` — removed `Unprocessable` (same).
- `backend/src/lib/sanitize.ts` — file deleted. `sanitizeString`/`sanitizeObject` referenced nowhere in src (frontend hit was an unrelated local variable).

## Refactors (behavior-preserving, typecheck clean)

- `backend/src/db/create-admin.ts` — `parseArgs` split into pure `parseFlags(argv)` (the `--k=v` parsing) and `collectArgErrors(args)` (validation rules). CLI printing/`process.exit` behavior unchanged.
- `backend/src/modules/orders/orders.service.ts` — `list` slimmed from ~56 lines to 8 by extracting module-level `buildListWhere`, `fetchOrderRows`, and `countOrderRows` (count-query join/no-join branch preserved). Public signature unchanged (`ListParams` extracted verbatim).
- `backend/src/modules/reports/reports.service.ts` — `getDashboard` body extracted into one fetcher per dashboard aggregate (`fetchTodayAgg`, `fetchYesterdayAgg`, `fetchPendingOrdersCount`, `fetchMonthRevenueAgg`, `fetchWeekRevenueRows`, `fetchTopCustomers`, `fetchTopProducts`, `fetchOutstandingDebts`, `fetchRecentInvoices`) plus pure `buildWeekBuckets`. SQL strings moved verbatim. Note preserved: the month-total aggregate is still fetched but its result discarded (4th slot in the destructuring), exactly as before.
- `backend/src/modules/auth/auth.service.ts` — `register` split into `assertRegistrationAllowed(totalUsers, authHeader)` (open first-bootstrap vs admin-bearer gate) and `createUserWithPassword` (hash + insert + empty-insert guard). Role ternary, error messages, and return shape unchanged.

## Finding turned out WRONG — skipped (not forced)

- **orders/products 28-line DRY clone (plan cites orders.service.ts lines 185-192): no such clone exists in the current tree.** Verified three ways: literal line-block diff of the two files (nothing >= 6 lines), whitespace-normalized diff (nothing >= 3 lines beyond the ~4-line generic list-scaffolding idiom), and a backend-wide sweep of the cited region (nothing >= 8 lines in any backend file). The two services share only the structural "conditions → Promise.all(rows, count) → `{items, total}`" pattern with different tables/columns; extracting a generic helper over that would add complexity, not remove it (KISS). The plan-permitted new `backend/src/lib/` helper file was therefore not created.

## Tests (written first, validated against pre-refactor code, then re-run post-refactor)

- `backend/src/modules/orders/orders.service.test.ts` — 8 tests: `list` ({items, total} shape, `Number()` count coercion, count-row-missing → 0, count query joins customers only when `q`/`companyId` present), `updateStatus` (success + NotFound), `recordPayment` (payment values incl. String() coercions, `{paidAmount, remaining}`, cache invalidation, overpayment guard, NotFound). Mocks: `config/db.js`, `reports/reports.service.js` (invalidateDashboardCache), `lib/price-lists.js` — fully DB/Redis-free via a chainable thenable fake query builder.
- `backend/src/modules/reports/reports.service.test.ts` — 4 tests: cache hit returns cached object untouched; full cache-miss mapping (zeros for empty aggs, week-bucket labels/sums, rank mapping, snake_case→camelCase, Number coercions, `cacheSet('cache:dashboard', result, 45)`); pg string aggregates coerced; `invalidateDashboardCache` deletes the key. Deterministic via fake timers pinned to 2026-09-15 local.
- One expectation corrected while characterizing: the 4th week label is `22/09-28/09` (label caps at `s + 6`, not month end) — locked actual behavior; code was correct.

## Verification

- `cd backend && pnpm exec vitest run` → **30/30 pass** (18 pre-existing + 12 new), both pre- and post-refactor.
- `pnpm --filter kiosk-backend typecheck` → pass.
- `cd backend && pnpm lint` → **pre-existing failure, unrelated to this package**: ESLint 9.39.4 aborts with "ESLint couldn't find an eslint.config.(js|mjs|cjs) file" (backend has no flat config; only `frontend/` and `templates/` do). Fails identically on the untouched baseline tree. Not fixed here because config changes are out of scope for this pass.

Status: DONE_WITH_CONCERNS
Summary: All Package A deletions and all four refactors applied behavior-preserving with 12 new DB-free characterization tests written first and kept green (30/30 suite, typecheck pass); the plan's orders/products 28-line clone finding was verified wrong and skipped rather than forced.
Concerns:
- Backend lint is broken at baseline (missing `eslint.config.*` for ESLint 9) — needs a separate config decision; I did not touch config per scope rules.
- The plan's orders/products dedup finding does not match the current tree (no clone exists); the controller may want to flag it back to repowise as stale.
