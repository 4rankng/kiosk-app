# B4 — Products & Price Lists → Untitled UI

Date: 2026-09-26
Owner: b4-products
Scope: restyle + recompose UI only; all react-query hooks, Zod schemas, RHF logic, TanStack Table wiring, URL state preserved; route files untouched.

## Files Modified

products (5):
- src/features/products/index.tsx — PageHeader (title/description/actions), UUI stat cards
  (surface shell `rounded-xl bg-primary shadow-xs ring-1 ring-secondary ring-inset` + FeaturedIcon
  modern/brand), base Button `Thêm` with Plus icon, icons from @untitledui/icons
  (Package, LayersTwo01, CoinsStacked01, CoinsHand). Dropped duplicate useDocumentTitle
  (PageHeader owns it); mobile hint suppression preserved via isMobile.
- src/features/products/components/products-table.tsx — toolbar search on UUI InputBase
  (SearchMd icon, h-9 wrapper, width via parent div), DataTableFacetedFilter/ViewOptions/Pagination
  (b3 wrappers) unchanged, "Xóa bộ lọc" tertiary Button, desktop table recomposed as plain
  table + UUI tokens (bg-secondary header row, border-secondary row borders, hover:bg-primary_hover,
  aria-sort kept). Loading/error EmptyState paths kept.
- src/features/products/components/products-columns.tsx — Badge (base, type='color', sm, gray),
  row actions on base Dropdown (DotsButton size-8, Pencil01/Trash01 items, destructive Xóa item
  styled via `[&_span]:text-error-primary [&_svg]:text-error-primary`). Column ids/accessors unchanged.
- src/features/products/components/product-mutate-dialog.tsx — ui/dialog + ui/sheet replaced by the
  UUI Modal pattern (ModalOverlay/Modal/Dialog, aria-labelledby via useId). ONE responsive modal:
  ModalOverlay is bottom-sheet on mobile, centered on desktop; sticky header/footer with internally
  scrolling form (`max-h-[inherit]` flex column). RHF register spread onto InputBase (ref forwarded),
  TextAreaBase for Mô tả, InlineAddCombobox + NumberInput untouched. Mobile 44px behavior now via
  responsive modal footer; `setOpen(null)` guarded `onOpenChange={(o) => { if (!o) setOpen(null) }}`.
- src/features/products/components/products-mobile-list.tsx — base Button (tertiary, icon-only,
  min 44px, aria-labels kept), UUI tokens for unit chip/dividers/empty text, Trash01/Pencil01.

price-lists (3):
- src/features/price-lists/index.tsx — PageHeader, Tag01 empty-state icon in dashed UUI surface,
  loading/empty conditionals unchanged; dropped duplicate useDocumentTitle (PageHeader owns it).
- src/features/price-lists/components/price-list-selector.tsx — ui/Select → RAC Select
  (selectedKey + onSelectionChange, Select.Item id/label, aria-label, size sm), create dialog →
  UUI Modal pattern with InputBase (tên) + RAC Select (công ty), form-attribute submit kept.
- src/features/price-lists/components/price-list-table.tsx — desktop table on UUI tokens, search on
  InputBase, Save01 save Button, mobile cards restyled to UUI card shell (rounded-xl ring-secondary);
  local-sync-during-render logic, bulk-save mutation + 4 invalidations, infinite scroll all kept.

Unchanged by design: products-provider.tsx, product-delete-dialog.tsx (ConfirmDialog already UUI),
products-dialogs.tsx, data/schema.ts.

## Verification

1. `npx tsc -b` — 0 errors in src/features/{products,price-lists}. Remaining project errors are in
   src/features/orders/* and src/features/reports/* (other batches, still in flight).
2. `pnpm exec eslint src/features/products src/features/price-lists` — 0 errors, 4 pre-existing-style
   warnings (react-hooks/incompatible-library on form.watch/useReactTable, react-refresh on provider).
3. `node scripts/guard-design-tokens.mjs` — clean.
4. `pnpm vitest run src/features/products src/features/price-lists` — no test files exist for these
   features (nothing to update; reported honestly).
5. grep lucide / @/components/ui/ in the two dirs — clean (also no legacy shadcn token classes).

## Notes / risks

- 44px rule respected: largest control is the mobile row buttons at exactly min 44px; no Button xl.
- Vietnamese copy preserved verbatim; submit buttons show spinner via isLoading instead of the
  "Đang lưu..." text swap (UUI pattern; the string still exists as fallback label logic in the
  price-list save button).
- During this batch several of my file writes suffered transient content corruption (repeated
  fragments); each file was re-read and verified clean before completion (products-table,
  product-mutate-dialog, products-mobile-list, price-list-selector, price-list-table all read back
  or fully typechecked).
