# B4 — Invoices feature → Untitled UI

Status: DONE
Date: 2026-09-26
Owner: b4-invoices (src/features/invoices/**, except invoice-print-document.tsx untouched)

## Verification

| Check | Result |
|---|---|
| `npx tsc -b` | 0 errors in src/features/invoices (39 errors remain, all in teammate files: dashboard, products — mid-edit by other agents) |
| `pnpm exec eslint src/features/invoices` | 0 errors (2 pre-existing `react-hooks/incompatible-library` warnings on the `useReactTable` pattern — same pattern existed before migration) |
| `node scripts/guard-design-tokens.mjs` | clean |
| `pnpm vitest run src/features/invoices` | no test files exist for this feature — nothing to run or `--update` |
| `grep -rn "lucide\|@/components/ui/" src/features/invoices` | empty (the untouched print document contains none either) |

## Per-file changes

1. **status-meta.ts** — lucide CheckCircle2/DollarSign/Clock/XCircle → `@untitledui/icons`
   CheckCircle/CurrencyDollar/Clock/XCircle. The per-status Tailwind className field is
   replaced by `badgeColor: BadgeColor<'pill-color'>` (success / warning / error / gray
   per the brief's semantic mapping). `destructive` flag and the paid / partial / pending /
   cancelled decision logic are unchanged; label copy unchanged.

2. **invoices-columns.tsx** — status cell now renders UUI `BadgeWithIcon`
   (pill-color, md → 12px text) driven by `meta.badgeColor`; code chip restyled to
   `bg-secondary text-secondary`; row actions rebuilt as UUI `Button color='tertiary'
   size='xs'` icon-only (Printer / CoinsHand, ≤32px) wrapped in base `Tooltip` with the
   original Vietnamese aria-labels; `TooltipProvider`/shadcn Tooltip removed; TanStack
   column defs, filterFn, and dialog-opening handlers untouched.

3. **invoices-table.tsx** — `ui/table` + `ui/input` imports removed: the table is now
   semantic `<table>` markup inside a UUI card wrapper (`rounded-lg bg-primary ring-1
   ring-secondary ring-inset`, header row `bg-secondary text-tertiary` 12px, row dividers
   `border-secondary`, `hover:bg-secondary/60`), aria-sort wiring kept. Search input →
   UUI `InputBase` with `SearchMd` icon (same controlled filter binding). Legend row icons
   → UUI icons with `text-fg-success-primary` / `text-fg-error-primary` /
   `text-fg-warning-primary` / `text-fg-quaternary`. All TanStack state, react-query,
   MobileCardView, and EmptyState usage untouched.

4. **payment-dialog.tsx** — Radix `ui/dialog` → UUI `ModalOverlay`/`Modal`/`Dialog`
   (dismissable, unlike ConfirmDialog) per the confirm-dialog exemplar; summary box
   restyled `bg-secondary`; cancel uses the Dialog render-prop `close`; submit button
   uses UUI `isLoading` (old disabled+label swap kept via the same `mutation.isPending`
   label). ADDED (deviation): `onError` toast ('Ghi nhận thanh toán thất bại...') — the
   mutation previously failed silently; everything else in the flow is identical.

5. **print-dialog.tsx** — same Modal pattern; entity picker buttons → UUI `Button
   color='secondary'` with nested spans (name + address); loading spinner lucide Loader2
   → `RefreshCw01 animate-spin`. `handlePrint` and the entire print-window readiness/
   polling logic are byte-identical to the original.

6. **data/data.ts** — removed dead `statusColorMap` (zero consumers anywhere in src;
   held old-theme classes). `statusOptions` kept as-is.

Unchanged by design: index.tsx (already on shared PageHeader/Header/Main), invoices-provider.tsx,
invoices-dialogs.tsx, invoices-mobile-config.ts, and invoice-print-document.tsx (print-only,
per instructions).

## Notes / deviations

- Row-action buttons are neutral `tertiary` UUI buttons; the old warning tint on the
  "Thu tiền" action is dropped — status color semantics now live in the status badges.
- The payment-failure toast is new (was a silent failure); flow logic otherwise unchanged.
- No test files exist under src/features/invoices, so step 4 of the verify list was a no-op.

Status: DONE
