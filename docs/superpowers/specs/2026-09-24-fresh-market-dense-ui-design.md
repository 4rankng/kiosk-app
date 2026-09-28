# Fresh Market — Dense UI Design System (kiosk-app)

Date: 2026-09-24
Status: Implemented (foundation + exemplar surfaces)
Superseded in part — 2026-09-28. See "Corrections" below. The **density contract**,
**status-colour semantics** and **contrast rationale** in this document still stand.
The **brand colour** and the **MCP/stack stance** no longer do.

## Outcome & Decisions

- Goal: polish UI/UX for the B2B wholesale app with an ownable identity and a
  strict data-density contract.
- Brand direction: **Fresh Market** — warm off-white base, ~~deep green primary~~,
  amber reserved for debt/outstanding, soft 10px radius. Light-only.
  *(2026-09-28: brand is now **indigo, oklch hue 265** — see the Token Contract note.)*
- Density contract (user-mandated): **type 11px / 12px only**; controls
  **30–36px** (h-7.5 / h-8 / h-9).
- Architecture: token-first. Density and color live in `theme.css` tokens and
  the component primitives; features inherit. No per-page one-offs.
- MCP stance (CORRECTED 2026-09-28 — the original note below was wrong):
  **UntitledUI PRO is the component layer.** The frontend is a native UntitledUI
  project on React Aria; the PRO catalog and page templates install with zero
  translation. **Tailkit is the layout lens only** — its raw JSX ships `dark:`
  variants, palette-numbered colours and Heroicons CSS, none of which are legal
  here, so its markup must be translated onto semantic tokens before it lands.
  See the "UI/UX work" section in `AGENTS.md` for the workflow and the
  token-translation table.
- ~~Original (obsolete) MCP comparison: Tailkit is the working source. Untitled
  UI is reference-only — its MCP installs React-Aria components that would
  conflict with the Radix/shadcn + lucide-only rule.~~ This held while the
  frontend was still on Radix + lucide. It is no longer true: the Radix layer
  has been fully replaced by React Aria + `@untitledui/icons`, and UntitledUI is
  now the source of truth for components.

## Token Contract (frontend/src/styles/theme.css)

> **Authoritative source: `frontend/src/styles/theme.css`.** The table below records the
> original 2026-09-24 proposal. The brand ramp has since moved from green to **indigo
> (oklch hue 265)** because money state is encoded as colour (paid / due / overdue) and the
> brand had to vacate the status family — the old green sat 0.068 OKLab ΔE from the success
> green, so a "paid" badge was indistinguishable from a primary button. The warm off-white
> page base is now a near-neutral `--color-paper` (chroma 0.005) rather than the tan-tinted
> value below. Read `theme.css` for current values; it documents the reasoning inline.

Palette (oklch, light-only) — *as originally specified, green brand*:

| Token | Value | Use |
|---|---|---|
| --background | 0.988 0.004 95 | warm off-white page base |
| --card / --popover | white | surfaces |
| --primary | 0.42 0.085 155 | deep green — actions, links, active states |
| --success | 0.55 0.12 150 | paid / positive trends |
| --warning | 0.62 0.13 70 | amber — debt, outstanding, "Đang xử lý" |
| --destructive | 0.577 0.245 27 | errors, destructive actions, "Chưa thanh toán" |
| --ring | 0.55 0.08 150 | green focus rings |
| --chart-1..5 | green→amber→teal→slate→moss ramp | Recharts |

Type scale (overrides Tailwind scale, app-wide):

| Token | Size | Line |
|---|---|---|
| --text-xs | 11px | 16px |
| --text-sm / --text-base / --text-lg / --text-xl / --text-2xl / --text-h1..h3 / --text-display | 12px | 18–20px |

Component sizes (shadcn primitives):

| Control | Height |
|---|---|
| Button default / icon | h-8 (32px) |
| Button sm / Select sm | h-7.5 (30px) |
| Button lg | h-9 (36px) |
| Input / Select default | h-8 |
| Table head | h-9, 11px muted |
| Table cell | py-1.5 (≈32px rows) |
| Card | py-4, px-4, gap-4 |

Status color semantics (single source `features/invoices/status-meta.ts`):

- paid / completed+paid → success (soft `bg-success/10 text-success`)
- pending / "Đang xử lý" → warning
- unpaid → destructive
- cancelled → muted/destructive
- Debt amounts and totals → `text-warning` (amber owns debt), destructive
  reserved for errors and destructive actions.

## Rules

1. Never hardcode palette hues (`emerald-600`, `amber-50`, …) — use semantic
   tokens (`text-success`, `bg-warning/10`, …).
2. Never exceed the 12px type ceiling for functional UI text; 11px for
   micro/meta text. Decorative error-code numerals exempt.
3. Vietnamese-first copy — no English UI strings (fixed "Rows per page" →
   "Dòng mỗi trang", "Page X of Y" → "Trang X/Y").
4. `tabular-nums` on every money/quantity figure.
5. New components: Tailkit MCP search → fetch → adapt via conventions
   overlay (light-only, tokens, lucide, `gap-*`, container queries).

## Verification

- `pnpm --filter @kiosk/shared build` ✓ then `pnpm build` (frontend):
  `tsc -b` ✓, vite build ✓ (314ms).
- Remaining follow-up (not blocking): browser-mode vitest suite requires
  Playwright chromium (`pnpm test:browser:install`); run `pnpm test` after
  install.
