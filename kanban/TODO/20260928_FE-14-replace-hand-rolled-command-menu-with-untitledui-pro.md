---
id: FE-14
title: "Replace the hand-rolled command menu with the UntitledUI PRO component"
severity: low
area: frontend
labels: [tech-debt, a11y, ui-ux, untitledui]
effort: S
status: todo
column: TODO
opened: 2026-09-28
---

# FE-14 — Replace the hand-rolled command menu with the UntitledUI PRO component

**Severity:** low · **Area:** frontend · **Effort:** S · **Labels:** tech-debt, a11y, ui-ux, untitledui

**Trạng thái:** TODO

## Problem

`frontend/src/components/command-menu.tsx` is hand-rolled. The UntitledUI PRO catalog ships a
keyboard-complete `command-menu` that is already available through the MCP
(`get_component("command-menu")` → `npx untitledui@latest add command-menu`).

`AGENTS.md` documents the `uui` skill as the entry point for UI work, but this file is the one
component in the app that pre-dates that convention and was never migrated.

## Impact

A hand-rolled command menu is where focus trapping, arrow-key handling and screen-reader
announcement go wrong. The replacement is a drop-in vendor component with zero translation,
because the app is already a native UntitledUI project.

## Proposal

```bash
cd frontend
npx untitledui@latest add command-menu --yes --license $UNTITLEDUI_KEY
```

Then swap the internals of `command-menu.tsx` to delegate to the vendor component, keeping the
existing search index and route targets. Verify with test-plan F-01 case 1.5 (sign out) and a
keyboard-only walk: `⌘K` → type → arrows → enter.

## Notes

Deliberately **not** bundled into the screen-consolidation work: it is a global component used
by the app shell, and swapping it deserves its own reviewable diff.

---

## Verification Notes

- Not started.
