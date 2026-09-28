---
id: QA-02
title: "Repowise regenerates AGENTS.md on every commit, leaving a dirty working tree"
severity: low
area: devops
labels: [tech-debt, repowise, workflow]
effort: S
status: todo
column: TODO
opened: 2026-09-28
---

# QA-02 — Repowise regenerates AGENTS.md on every commit, leaving a dirty tree

**Severity:** low · **Area:** devops · **Effort:** S · **Labels:** tech-debt, repowise, workflow

**Trạng thái:** TODO

## Problem

`AGENTS.md` and `.claude/CLAUDE.md` each contain a Repowise-managed block between markers.
Repowise re-indexes on every commit and rewrites that block with a new "Last indexed: <sha>"
stamp and refreshed health figures. The result is a **self-perpetuating loop**:

1. commit anything → Repowise regenerates the block → the tree is dirty
2. committing the regeneration triggers another regeneration
3. `git pull` and `git checkout` then fail with *"You have unstaged changes"*

This actually bit during PR #19: the sync to `main` was blocked twice and had to be worked
around by discarding the stamp.

The repository already carries several `chore: refresh repowise agent context` commits, so the
pattern is established — but it is costing a real step on every sync.

## Options

1. **Commit the stamp each time (current).** Zero config; noisy history; the loop persists.
2. **Run `repowise update` on a schedule instead of on commit.** Stops the per-commit churn.
   Requires changing how Repowise is invoked.
3. **Gitignore the two files and generate them on demand.** Cleanest tree, but they are
   genuinely useful checked in — they are the agent-facing context for anyone who clones.
4. **Add a `pre-commit` / `post-commit` hook that auto-commits the regeneration** as its own
   commit, so the tree is clean and the loop is invisible.

## Recommendation

Option 4, or option 2 if Repowise supports a non-watch mode. Do **not** gitignore them.

## Notes

The `## UI/UX work` section deliberately sits **after** `REPOWISE_AGENTS:END` precisely so
regeneration cannot erase it — that has now been confirmed across three regenerations and
should be preserved by whatever is chosen here.

## Verification Notes

- Observed repeatedly on 2026-09-28 across PRs #18 and #19.
