---
id: QA-01
title: "Add CI so the five-gate check runs on every PR instead of only locally"
severity: medium
area: devops
labels: [ci, quality-gate, tech-debt]
effort: M
status: todo
column: TODO
opened: 2026-09-28
---

# QA-01 — Add CI so the five-gate check runs on every PR

**Severity:** medium · **Area:** devops · **Effort:** M · **Labels:** ci, quality-gate, tech-debt

**Trạng thái:** TODO

## Problem

The repository has **no CI workflow at all** — `.github/workflows/` does not exist. The only runs
in the history are Dependabot's own version bumps.

Every change in PRs #18 and #19 was merged on the strength of a **local** gate. That worked,
but it means nothing stops a regression landing: the check is a matter of remembering to run
it, and the design-token guard, the contrast suite and the typecheck are all only as reliable
as the person pushing.

## Proposal

Add `.github/workflows/ci.yml` running the same five gates documented in
`testplan/README.md` § 1, on `pull_request` and on `main`:

```yaml
name: ci
on:
  pull_request:
  push:
    branches: [main]
jobs:
  gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      # postgres + redis are required by the backend integration tests
      - run: docker compose up -d postgres redis
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm build
      - run: pnpm --filter backend test
      - run: pnpm --filter frontend test
```

## Notes

- The backend suite opens a real Redis client on import and asserts against the local
  `kiosk_dev` database, so the services must be up before it runs.
- The frontend suite needs a Chromium download for the browser-mode Vitest provider
  (`pnpm exec playwright install --with-deps chromium`).
- Keeping the gates identical to the local commands means `testplan/README.md` § 1 stays the
  single source of truth.
