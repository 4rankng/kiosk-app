# Kanban

Issue tracking for kiosk-app. One markdown file per issue, named
`YYYYMMDD_<ID>-<slug>.md`, with YAML frontmatter. **Status is the column it lives in**, not a
field in the body.

## Columns

| Column | Meaning |
|---|---|
| `TODO/` | Open, not started |
| `IN_PROGRESS/` | Being worked on |
| `QA_TESTED/` | Dev done, awaiting QA sign-off |
| `DEV_COMPLETED/` | Signed off |

## Board

| ID | Title | Severity | Area |
|---|---|---|---|
| [FE-14](TODO/20260928_FE-14-replace-hand-rolled-command-menu-with-untitledui-pro.md) | Replace the hand-rolled command menu with the UntitledUI PRO component | low | frontend |
| [FE-15](TODO/20260928_FE-15-normalise-fg-quaternary-drift-in-vendor-components.md) | Normalise the remaining `text-fg-quaternary` drift in vendor components | low | frontend |
| [BE-01](TODO/20260928_BE-01-pin-dev-toolchain-against-stale-esbuild.md) | Pin the dev toolchain against drizzle-kit's stale esbuild | low | backend |
| [QA-01](TODO/20260928_QA-01-add-ci-five-gate-check-on-every-pr.md) | Add CI so the five-gate check runs on every PR | medium | devops |
| [QA-02](TODO/20260928_QA-02-repowise-regeneration-dirties-the-tree.md) | Repowise regenerates AGENTS.md on every commit, leaving a dirty tree | low | devops |

## Recently completed

| ID | Title |
|---|---|
| FE-13 | Sign-in polish and placeholder cleanup |
| FE-12 | Error pages Vietnamese localization and polish |
| FE-11 | POS / new order desktop layout and entity auto-select |
| FE-10 | Reports pages auto-fetch and presentation polish |
| FE-09 | Price lists auto-select default and empty state |
| FE-08 | Invoices status badge, paid calc and view options i18n |
| FE-07 | Products page: fix NaN stats, wire category and unit columns |
| FE-06 | Design-token lint guard: ban hardcoded hues and oversized type |
| FE-05 | Code-split the 500 kB chunk warning |
| FE-04 | POS mobile touch-target decision |
| FE-03 | Finish density sweep on remaining surfaces |
| FE-02 | Visual QA and screenshot rebaseline |
| FE-01 | Fix 13 pre-existing test failures (English strings vs Vietnamese UI) |

## Test plan

Every flow, both viewports, and the regression cases for previously-fixed defects live in
[`testplan/README.md`](../../testplan/README.md). A change is not done until the exit criteria
in § 6 are met.
