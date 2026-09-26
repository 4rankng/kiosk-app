# Fresh Market — Dense UI Design System (kiosk-app)

Date: 2026-09-24
Status: Implemented (foundation + exemplar surfaces)

## Outcome & Decisions

- Goal: polish UI/UX for the B2B wholesale app with an ownable identity and a
  strict data-density contract.
- Brand direction: **Fresh Market** — warm off-white base, deep green primary,
  amber reserved for debt/outstanding, soft 10px radius. Light-only.
- Density contract (user-mandated): **type 11px / 12px only**; controls
  **30–36px** (h-7.5 / h-8 / h-9).
- Architecture: token-first. Density and color live in `theme.css` tokens and
  shadcn primitives; features inherit. No per-page one-offs.
- MCP comparison: **Tailkit** is the working source (raw JSX, shadcn-adjacent,
  matches `.claude`-skill conventions). **Untitled UI** is reference-only — its
  MCP installs React-Aria components that would conflict with the
  Radix/shadcn + lucide-only rule. Its visual idioms (soft status badges,
  quiet muted table headers) were borrowed, not its stack.

## Token Contract (frontend/src/styles/theme.css)

Palette (oklch, light-only):

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
