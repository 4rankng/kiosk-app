# B4 — Customers + Companies → Untitled UI

Status: DONE
Date: 2026-09-26
Owner: b4-people (files: src/features/customers/**, src/features/companies/**)

## Verification summary

| Check | Result |
|---|---|
| `npx tsc -b` | 0 errors in owned dirs. Remaining errors are other teams' mid-edit files: `features/dashboard`, `features/products` (b4-dash-reports / b4-products), `features/orders/components/pos-category-grid.tsx` (fe-inventory) |
| `pnpm exec eslint src/features/customers src/features/companies` | 0 errors, 9 warnings — all pre-existing patterns carried over from the original code (provider react-refresh exports, original `useEffect`/`useMemo` deps, `useReactTable` compiler skips) |
| `node scripts/guard-design-tokens.mjs` | clean |
| `pnpm vitest run src/features/customers src/features/companies` | no test files exist for either feature; nothing to update |
| `grep -rn "lucide\|@/components/ui/"` in owned dirs | empty (exit 1) |

## Per-file changes (old → new)

### features/customers

1. **index.tsx** — ui Button + lucide `Plus` → UUI `Button` (base/buttons) with
   `iconLeading={Plus}` from `@untitledui/icons`, `onPress`. Header/Main/Search/
   NotificationBell/ProfileDropdown wiring and Vietnamese copy untouched.

2. **customers-table.tsx** — shadcn `ui/table` primitives → inline raw table
   markup with the UUI card recipe (`rounded-lg bg-primary shadow-xs ring-1
   ring-secondary ring-inset`, `border-secondary` row borders, hover
   `bg-primary_hover`); `th` keeps `aria-sort` via `getColumnAriaSort`. Desktop
   filter `ui/input` → UUI `InputBase` (size sm, `SearchMd` icon, wrapper
   width 250px desktop / full mobile). TanStack wiring, faceted filter, view
   options, pagination, MobileCardView, EmptyState, query hooks untouched.

3. **customers-columns.tsx** — token restyle only (`text-muted-foreground` →
   `text-tertiary` in the contact cell). Columns/headers/IDs unchanged.

4. **customer-actions-cell.tsx** — ghost icon buttons → UUI `Button`
   `color='tertiary'` / `color='tertiary-destructive'`, `size='xs'` icon-only
   (32px, within the ≤44px rule), `Pencil01`/`Trash01` from `@untitledui/icons`,
   `aria-label` copy preserved.

5. **customer-mutate-dialog.tsx** — `ui/dialog` → UUI `ModalOverlay`/`Modal`/
   `Dialog` (confirm-dialog exemplar pattern): `aria-labelledby` h2 title,
   `text-md font-semibold` heading, `text-sm text-tertiary` description, footer
   `border-t` action row. Fields: `TextField` + `Label` + `InputBase` with RHF
   `register` spread (b5 auth pattern); errors `text-xs text-error-primary`.
   Company picker: base `Select` controlled via
   `selectedKey`/`onSelectionChange` → `form.setValue(..., { shouldValidate:
   true })`. Submit button `isLoading` + `showTextWhileLoading` keeps the
   'Đang lưu...' copy. RHF/zod/react-query logic and use-dialog-state provider
   pattern unchanged. Max-w-lg kept from old DialogContent.

6. **customer-delete-dialog.tsx** — already on shared ConfirmDialog; unchanged.
7. **customers-provider.tsx, customers-dialogs.tsx, customers-mobile-config.ts,
   data/schema.ts, company-cell.tsx** — unchanged (no UI-primitive usage).

### features/companies

8. **index.tsx** — same Button/Plus swap as customers.

9. **companies-table.tsx** — same raw-table UUI recipe as customers-table
   (no toolbar in this feature). Pagination/MobileCardView/EmptyState untouched.

10. **companies-columns.tsx** — ui Badge → UUI `Badge type='color'`:
    'Đã gán' brand, 'Chưa gán' gray + `text-tertiary`; `taxCode` column kept
    (restored after a transcription slip during the write, verified present).
    Action buttons same UUI recipe as customer actions.

11. **company-mutate-dialog.tsx** — same UUI Modal + TextField/Label/InputBase +
    base Select pattern as the customer dialog; price-list Select controlled via
    `selectedKey`/`onSelectionChange`; `createCompany` null-field payload
    untouched.

12. **company-delete-dialog.tsx** — `ui/alert-dialog` → shared `ConfirmDialog`
    (per brief) keeping the `useMutation` flow: `desc` includes the company
    name in `<strong>`, `confirmText` swaps to 'Đang xóa...' while pending,
    `isLoading` wired, `destructive`. Radix AlertDialog and ConfirmDialog both
    close on Esc only, so dismissal semantics match.

13. **companies-provider.tsx, companies-dialogs.tsx, companies-mobile-config.ts,
    data/schema.ts** — unchanged.

## Notes / deviations

- `ui/table` has no UUI replacement in `components/base`, and the batch grep
  gate bans `@/components/ui/` imports, so table markup is inlined as raw
  elements with semantic-token classes matching b3's mobile-card recipe. Both
  tables duplicate ~20 lines of markup; a shared primitive could be extracted
  later if more features need it (out of scope for this batch's ownership).
- Submit buttons use `isLoading` + `showTextWhileLoading` (spinner + text),
  which keeps the original pending-state copy visible — slightly richer than
  the old disabled-text-swap but same behavior otherwise.
- Lucide→UUI icon mapping used where lucide names had UUI equivalents:
  `Pencil`→`Pencil01`, `Trash2`→`Trash01` (both verified as real exports via a
  tsc probe, then removed).

## Unresolved questions

None blocking.
