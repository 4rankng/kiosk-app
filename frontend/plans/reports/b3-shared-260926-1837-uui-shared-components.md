# B3 — Shared components → Untitled UI primitives

Status: DONE
Date: 2026-09-26
Owner: b3-shared (files: page-header, empty-state, confirm-dialog(+test), error-boundary, password-input(+test), number-input, inline-add-combobox, sign-out-dialog, data-table/*, dead-code deletion)

## Verification summary

| Check | Result |
|---|---|
| `npx tsc -b` | 0 errors (whole project incl. teammate files) |
| `pnpm exec eslint <owned files>` | 0 errors |
| `node scripts/guard-design-tokens.mjs` | clean |
| `pnpm vitest run confirm-dialog password-input --update` | 13/13 pass |
| `pnpm vitest run sign-out-dialog.test.tsx` | 2/2 pass (extra check) |
| grep lucide / @/components/ui in owned files | empty |

Note on screenshots: the test setup has no visual-snapshot plugin and no
`__screenshots__` artifacts exist; tests are logic-only. `--update` was passed
as instructed but there was nothing to regenerate. Reported honestly.

## Per-file changes (old → new)

1. **page-header.tsx** — h1 `text-h1` (old token) → `font-heading text-display-xs
   font-semibold text-primary` (12px dense contract); description `text-xs
   text-muted-foreground` → `text-sm text-tertiary`. Props API unchanged
   (title/description/actions/className + useDocumentTitle).

2. **empty-state.tsx** — rebuilt on UUI `EmptyState` primitives
   (Root/Header/Content/Footer/Title/Description/FeaturedIcon) from
   `@/components/application/empty-state/empty-state`. Error variant: FeaturedIcon
   color `error` + AlertCircle; empty variant: custom `icon` ReactNode passthrough
   (preserved for price-lists) else gray FeaturedIcon. Loading variant keeps
   skeleton rows as inline `animate-pulse bg-secondary` divs (ui/skeleton banned).
   Root size `sm` keeps the 12px contract. `role='alert'` on error kept.

3. **confirm-dialog.tsx** — Radix `ui/alert-dialog` → UUI `ModalOverlay`/`Modal`/
   `Dialog` (react-aria) + UUI Button. Controlled via `isOpen`/`onOpenChange`
   (API prop names `open`/`onOpenChange` kept). Cancel closes via Dialog render-prop
   `close`; confirm `color='primary-destructive'` when destructive;
   `type/form` submit wiring kept; `disabled`/`isLoading` map to
   `isDisabled`/`isLoading`. `aria-labelledby` wired to the h2 title (fixes RAC
   dialog-title a11y warning). Escape still dismisses; outside click does NOT
   (isDismissable=false, matches old AlertDialog).

4. **error-boundary.tsx** — lucide AlertCircle/RefreshCw → `@untitledui/icons`
   AlertCircle/RefreshCw01 + UUI Button (color primary). Class logic untouched;
   copy Vietnamese.

5. **password-input.tsx** — native input + ui/button + lucide → UUI `InputBase`
   with `type='password'` (built-in Eye/EyeOff toggle). className → wrapperClassName;
   `disabled` → isDisabled + a `<fieldset disabled>` wrapper because React Aria's
   Group does not propagate disabled to the toggle button. RHF register spread
   (name/onChange/onBlur/ref) passes through the native input. `size` omitted from
   the HTML-attrs Omit (collided with UUI size prop).

6. **number-input.tsx** — ui/input → UUI `InputBase`, size sm, `inputMode='numeric'`,
   text-right kept. **Deviation from brief:** NOT the react-aria NumberField-based
   `InputNumber`, because it would change the X.XXX Vietnamese display/parse
   contract (lib/format `formatNumber`/`parseFormattedNumber`) and the
   value/onValueChange API; InputNumberBase's steppers are non-functional without a
   NumberField parent. Formatting logic is untouched in lib/format.

7. **inline-add-combobox.tsx** — Radix Select + ui/input/button + lucide → UUI
   `ComboBox` (base/select) + `SelectItem` + `InputBase` + UUI Buttons.
   "Thêm mới..." is a ListBoxItem with `onAction` (fires action instead of
   selection); type-to-filter added (onInputChange filter); `emptyMessage` renders
   as a disabled item when options are empty. API unchanged
   (options/value/onChange/onCreate/placeholder/emptyMessage).

8. **sign-out-dialog.tsx** — no change needed; ConfirmDialog API preserved.
   Verified by its own tests (2/2 pass).

9. **data-table/** — all TanStack logic/hooks/URL-state untouched.
   - column-header: ui/dropdown-menu + Radix icons → UUI `Dropdown` + UUI Button
     (tertiary, ArrowsDown/ArrowUp/ArrowDown — note `ArrowUpdown` does NOT exist in
     @untitledui/icons; `ArrowsDown` used). Vietnamese menu items
     (Tăng dần/Giảm dần/Ẩn cột).
   - faceted-filter: ui/popover+command+badge → UUI Dropdown (selectionMode
     multiple, checkbox indicators, count `addon`) + UUI Badge (`type='color'`).
     Dropped the cmdk search field (UUI Dropdown has no search; lists are small).
     "{n} selected" → "{n} đã chọn"; "Xóa bộ lọc" clear item.
   - view-options: ui/dropdown-menu checkbox items → UUI Dropdown
     selectionMode multiple + checkbox indicators + SectionHeader 'Bật/tắt cột'.
   - bulk-actions: ui/button/badge/separator/tooltip + lucide → UUI Button +
     Badge + UUI separators; Escape check switched from data-slot selectors to
     `[role="menu"]`; copy Vietnamese. (Exported but currently has no feature
     consumers.)
   - toolbar: ui/input → UUI InputBase with SearchMd icon; default placeholder
     'Filter...' → 'Lọc...'; Reset → 'Đặt lại' (XClose). (No feature consumers.)
   - pagination: ui/button+select + Radix icons → UUI Button (secondary/primary) +
     base Select (items API) + UUI chevron icons; Vietnamese sr-only labels
     (Trang đầu/trước/sau/cuối); container-query layout kept.
   - mobile-card.tsx: UUI card recipe (`rounded-lg bg-primary shadow-xs ring-1
     ring-secondary ring-inset`), UUI chevrons, text-secondary/primary/text-tertiary
     tokens; tap targets ≤ h-11; expandable header button behavior kept.
   - mobile-card-view.tsx: token restyle only (text-muted-foreground →
     text-tertiary, detail values text-secondary); logic untouched.
   - aria-sort.ts, mobile-card-types.ts, index.ts: untouched (pure logic/types).

10. **Deleted `src/components/ui/form.tsx`** — after rewriting
    password-input.test.tsx (the only importer, previously via ui/form's
    RHF helpers) it had zero importers. No `form.test.tsx` existed.
    `ui/scroll-area.tsx` NOT deleted: command-menu.tsx (teammate's file) still
    imports it.

## Consumer-API notes / deviations

- The brief described ConfirmDialog API as `description`/`confirmBtnText` with
  optional `open`/`onOpenChange`; the actual baseline API (git a387f2e, unchanged
  in tree) is `desc`/`confirmText` with required `open`/`onOpenChange` plus
  `disabled`, `children`, and the `form`/`handleConfirm` union. I kept the REAL
  API — all existing consumers (sign-out-dialog, customer/product delete dialogs)
  compile and their tests pass.
- password-input toggle aria-label is now `Toggle password visibility`
  (hardcoded English inside UUI InputBase; base/ is outside my ownership).
  Test updated to match.
- password-input/number-input no longer accept the native `size` HTML attribute
  (collides with UUI size prop; no consumer passed it).
- toolbar's default placeholder is now Vietnamese 'Lọc...' (was English 'Filter...'),
  no consumers existed.

## Unresolved questions

None blocking.