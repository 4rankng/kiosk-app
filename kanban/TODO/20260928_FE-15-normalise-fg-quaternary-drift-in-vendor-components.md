---
id: FE-15
title: "Normalise the remaining text-fg-quaternary drift in vendor components"
severity: low
area: frontend
labels: [tech-debt, design-tokens, contrast]
effort: S
status: todo
column: TODO
opened: 2026-09-28
---

# FE-15 — Normalise the remaining `text-fg-quaternary` drift in vendor components

**Severity:** low · **Area:** frontend · **Effort:** S · **Labels:** tech-debt, design-tokens, contrast

**Trạng thái:** TODO

## Problem

`--color-fg-quaternary` is **neutral-400**; `--color-text-quaternary` is **neutral-500**. The two
token families are otherwise identical (`primary` 900, `secondary` 700, `tertiary` 600, `white`
white), so a component using one where the other is meant renders a different grey.

App code was normalised in PR #19 (27 sites, now 0). **72 occurrences remain inside
`src/components/{base,application,foundations}`** — UntitledUI vendor code, which the landing
rule in `AGENTS.md` declares read-only because a future `npx untitledui add` would clobber a
hand edit.

Practical effect is a possible one-step grey difference between a vendor-rendered muted label
and an app-rendered one. `contrast.test.ts` still passes, so nothing is failing WCAG today.

## Options

1. **Leave as is (current).** Zero risk; accept a subtle inconsistency. Vendor code stays
   pristine and upgradeable.
2. **Vendor a deliberate override** in `src/styles/theme.css` that maps `fg-quaternary` onto the
   same value, applied globally rather than by editing vendor files. Survives
   `untitledui add`, but changes the token for any future component that relies on the
   distinction.
3. **Hand-edit vendor files.** Rejected — directly violates the landing rule.

## Recommendation

Option 2 if the visual review in a future pass shows a visible seam at normal viewing size;
option 1 otherwise. Decide with eyes on a real screen, not from the token values.

## Verification Notes

- Not started. Count confirmed at 72 on 2026-09-28 via
  `grep -ro 'text-fg-quaternary' frontend/src/components/{base,application,foundations,shared-assets}`.
