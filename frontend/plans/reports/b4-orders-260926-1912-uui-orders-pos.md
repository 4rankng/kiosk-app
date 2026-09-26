# B4 — Orders (POS create flow) → Untitled UI

Phase: b4-orders · Date: 2026-09-26 · Status: DONE

## Files modified (all under src/features/orders/components/)
- order-create.tsx — UUI Button (lg/primary, `min-h-11`), UUI tokens for section cards
  (`rounded-xl bg-primary ring-1 ring-secondary_alt shadow-xs`), brand step badges
  (`bg-brand-solid text-white`), header icon `ShoppingCart01 text-brand-secondary`,
  sticky mobile review bar = UUI Button tertiary, `text-quaternary` meta, h1 →
  `font-heading text-display-xs`. Cart state, mutation, item math, submit guards, query
  invalidations: untouched. Route file untouched.
- pos-category-grid.tsx — category pills `min-h-11` (active `bg-brand-solid`, inactive
  `bg-secondary text-tertiary hover:bg-secondary_hover`); product tiles rebuilt as
  single-line `min-h-11` (44px cap honored as both min and max): name (truncate) +
  price·unit + Plus icon. Two-line tile at grid-cols-2 could not fit 44px; unit moved
  onto the price line (`1.000 · hộp`).
- product-search.tsx — desktop dropdown = InputBase(sm, SearchMd) + UUI popover panel
  (`rounded-lg bg-primary shadow-lg ring-1 ring-secondary_alt`, rows hover:bg-secondary);
  mobile ui/sheet → UUI Modal (bottom sheet on mobile), CloseButton header, InputBase,
  same results list/empty copy. Search query, price-list pricing, blur-timeout, add-to-cart
  flow unchanged.
- customer-selector.tsx — same InputBase + popover treatment; selected-state card now
  `bg-secondary`, icons Building05/Tag01, "Thay đổi" = Button link-gray; mobile sheet →
  UUI Modal. Selection + priceList propagation unchanged.
- order-line-item.tsx — steppers = UUI Button secondary icon-only (`size-10 sm:size-8`,
  Minus/Plus), remove = tertiary-destructive (X), NumberInput h-10 sm:h-8 (X.XXX contract
  via lib/format untouched), line card `rounded-xl ring-1 ring-secondary_alt`, line total
  `text-brand-secondary`.
- order-line-items.tsx — empty cart uses shared EmptyState (empty variant) with
  ShoppingCart01.
- order-review-sheet.tsx — ui/sheet → UUI SlideoutMenu (right drawer; Header with built-in
  close, Content flex-1 scroll, Footer sticky buttons). Review-then-submit flow identical:
  adjust qty/price, summary, entity, "Tạo hóa đơn", "Đóng". Cart-empty state = EmptyState.
- order-success-dialog.tsx — ui/dialog → UUI Modal pattern (ConfirmDialog-style), success
  featured circle `bg-success-secondary` + `CheckCircle text-fg-success-primary`, order
  summary rows preserved, Đóng button.
- business-entity-selector.tsx — ui/radio-group → react-aria-components RadioGroup/Radio
  pills (sr radios removed in favor of real RAC radios): selected `border-brand
  bg-brand-secondary/50 text-brand-secondary` + `bg-brand-solid` dot; unselected
  `border-secondary bg-primary`; `min-h-9`, focus-visible ring. Auto-select-first effect
  and copy unchanged.
- order-summary.tsx — token remap only (text-secondary/tertiary, border-secondary);
  NumberInput loses fixed h-9 (InputBase sm ≈ 36px); totals row `border-t border-secondary`.

## Verification
- npx tsc -b: 0 errors in src/features/orders (remaining tsc output is teammate-owned:
  layout/*, dashboard, products, price-lists).
- pnpm exec eslint src/features/orders: 0 errors, 2 warnings — both pre-existing
  exhaustive-deps patterns carried over unchanged from the original code.
- node scripts/guard-design-tokens.mjs: clean.
- grep lucide / @/components/ui/ in src/features/orders: empty.
- Fixed-height sanity: only `size-16` (success icon circle, decorative, non-control,
  mirrors original h-16 w-16). All tappable controls ≤ 44px (min-h-11 tiles/pills/CTAs,
  size-10 sm:size-8 steppers, min-h-9 entity pills). Button size xl never used (lg max).

## Notes
- Product tiles were recomposed from two-line (~54px) to single-line to satisfy the hard
  44px cap; unit moved onto the price line so no product info is lost.
- Review sheet is now a right-side drawer (SlideoutMenu max-w-100 → full width on phones)
  instead of a bottom sheet; the brief allowed slideout-menu or Modal, flow identical.
- No unit tests exist for features/orders (none existed before this phase either).
