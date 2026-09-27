# Package file → silversea-prod memory `ui-density-wave-2026-09-26-27.md`

Write the content below to
`~/.claude/projects/-Volumes-LexarSSD-projects-silversea-prod/memory/ui-density-wave-2026-09-26-27.md`

```markdown
---
name: ui-density-wave-2026-09-26-27
description: "UI density directives 09-26/27: 2-tier command bar headers (~72–80px), master data = data grid not card feed, driver rows label-left/value-right 44–52px, empty-state illustration set, NO keyboard-shortcut text app-wide, SĐT kho tap-to-call"
metadata:
  node_type: memory
  type: feedback
---

User UI directives from the 2026-09-26 12:51 → 2026-09-27 01:56 sessions. These extend,
not replace, [[design-law-book-canonical]] and [[ui-control-height-width-ruling-2026-09-26]].

**Why:** Chief reviewed every page after the chi-phí wave and issued blueprint directives
per screen — headers running 160–280px with hollow metric cards, master data rendered as
card feeds, duplicated metric cards, scattered filters, oversized/decorative icons.

**How to apply:**
- **2-tier command bar is the canonical page header.** Title + counters + search/filters +
  actions consolidated into a high-density 2-row ribbon, aim 72–80px total (was 160–280px).
  Page actions sit top-right beside the primary CTA, detached from data-summary strips.
- **Master data = structured data table, never card feed.** Customer/supplier registries
  render as command bar + data grid; no accordion/elastic card lists; no metric cards that
  duplicate the same numbers as filter pills underneath.
- **Driver (my-trips) density:** single-line label-left / value-right rows, settings-list
  style, 44–52px row height, 12px vertical padding; 2-column layouts wherever fields
  permit; never stagger paired date fields diagonally across rows/columns.
- **NO keyboard-shortcut text anywhere** (2026-09-27 01:28, HARD): "we dont show keyboard
  shortcut text in any control" — no ⌘K badges, no shortcut hints, whole app.
- **Empty states use the 4-image flat-illustration set** (2026-09-26 12:52): empty
  clipboard+parked truck (Không có tác vụ), documents+magnifier (Chứng từ giao hàng), fuel
  pump (Ảnh nhiên liệu), open folder (Chi phí lô hàng); app-green flat set, no baked-in
  text so Vietnamese labels sit cleanly underneath.
- **SĐT kho = the call affordance.** The phone number itself is the tappable call button;
  no chi-duong text; no oversized decorative icon blobs; camera/contact icons coherent
  across pages.
- Row hover must reset the instant the pointer leaves (a persistently tinted row was
  reported 09-27 01:18).

All density fixes: kanban ticket first ([[tickets-before-fixes-hard-rule]]); uncertain
design → consult nepocorp ([[nepocorp-ui-ux-reference]]).

Source: sessions 2026-09-26 12:51–2026-09-27 01:56. Confidence: high (explicit, repeated).
```
