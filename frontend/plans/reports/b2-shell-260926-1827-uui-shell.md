# B2 Shell Rebuild — Implementation Report

- Batch: B2 (app shell + global overlays on Untitled UI primitives)
- Date: 2026-09-26
- Status: DONE
- Branch: redesign/untitled-ui (working tree, not committed per instructions)

## Files Modified (10/10 in ownership)

1. `src/components/layout/nav-group.tsx` — Rewritten without ui/sidebar, ui/collapsible, ui/dropdown-menu, ui/badge, lucide. Leaf items are TanStack `Link`s styled per UUI nav language (h-9, rounded-md, px-2, text-sm font-semibold, text-secondary, hover:bg-primary_hover, active bg-secondary/text-secondary_hover via ported `checkIsActive`; icon size-5 text-fg-quaternary). Collapsible groups: local `useState` disclosure, ChevronDown rotates when open, children `pl-6`. Collapsed rail (collapsible==='icon' && collapsed): icon-only size-9 links, groups link to first child, UUI Tooltip (right). `forceExpanded` prop for the drawer. Links close the drawer on navigate.
2. `src/components/layout/app-title.tsx` — favicon.png + bold "TingTing Kiosk" linking to `/`; collapses to icon-only when rail active; `forceExpanded` for the drawer.
3. `src/components/layout/app-sidebar.tsx` — `AppSidebar`: fixed desktop aside `hidden lg:flex`, floating → `my-2 ml-2 rounded-xl ring-1 ring-secondary bg-primary`; sidebar/inset → flush `border-r border-primary`; w-60 / w-16 rail (only when collapsible==='icon'); `collapsible==='offcanvas'` renders nothing. `MobileSidebar` (new export): controlled RAC ModalOverlay drawer (items-start, slide-from-left, w-60), AppTitle + close ButtonUtility + same NavGroups force-expanded. Nav footer omitted — no /settings route exists.
4. `src/components/layout/header.tsx` — h-12, sticky, scroll-shadow kept (shadow-xs + bg-primary/80 backdrop blur). Two toggles: mobile (`lg:hidden`) and desktop (`hidden lg:inline-flex`, hidden when collapsible==='none'); icon Menu01; both aria-labelled 'Mở menu điều hướng'; icon mode toggles collapsed, offcanvas opens the drawer; vertical divider `h-6 w-px bg-border-secondary`. Uses UUI ButtonUtility (tertiary, icon 20px + p-1.5 = 32px target).
5. `src/components/layout/authenticated-layout.tsx` — LayoutProvider > SidebarUIProvider > Shell. Shell renders SkipToMain, AppSidebar (unless offcanvas), MobileSidebar, and `main#content` with responsive padding: floating `lg:pl-[calc(15rem+8px)]` / `lg:pl-[calc(4rem+8px)]`, flush `lg:pl-60`/`lg:pl-16`, none when offcanvas. Inset variant: main gets bg-secondary and an inner rounded-xl border bg-primary container. Keeps `children ?? <Outlet/>`, @container/content, has-data-[layout=fixed]:h-svh. Note: the old `getCookie('sidebar_state')` default read moved into SidebarUIProvider (use-sidebar-ui.tsx reads the cookie at init) — no redundant read here.
6. `src/components/search.tsx` — UUI Button color='secondary' size='sm' with iconLeading=SearchLg (verified exported), Vietnamese placeholder, ⌘K kbd hint, aria-keyshortcuts, className passthrough kept. HTML-button props spread cast to UUI ButtonProps (RAC handler types differ from React's; consumers pass className only).
7. `src/components/profile-dropdown.tsx` — UUI Dropdown (MenuTrigger > Button tertiary icon-only User01 > Popover w-56 > Menu with Section header name/email, Separator, 'Đăng xuất' onAction). SignOutDialog wiring unchanged.
8. `src/components/notification-bell.tsx` — DialogTrigger > Button tertiary (Bell03) with RAC Popover nested inside the trigger, Dialog aria-label='Thông báo', w-80 content preserved in Vietnamese.
9. `src/components/config-drawer.tsx` — Radix RadioGroup removed. Custom RadioCard buttons (role=radio, aria-checked, aria-label 'Chọn <label>', data-state checked/unchecked, UUI token styling: selected ring-2 ring-brand + bg-brand-solid check badge; icon fill-brand vs fill-fg-quaternary). RadioCardGroup generic over value type. All section semantics preserved (SidebarConfig/LayoutConfig/DirConfig, per-section resets via ButtonUtility xs + RefreshCcw02, custom SVG assets, Vietnamese copy, reset wiring). Trigger: DialogTrigger + ButtonUtility tooltip='Mở cài đặt giao diện'. Drawer body: ModalOverlay > Modal (max-w-sm) > Dialog aria-label='Cài đặt' with CloseButton (slot=close, label='Đóng') and destructive 'Đặt lại' Button (primary-destructive).
10. `src/components/command-menu.tsx` — cmdk removed. UUI Modal (application/modals) with controlled isOpen/onOpenChange; own filtered list (case-insensitive, matches nested 'parent child'), input placeholder 'Nhập lệnh hoặc tìm kiếm...', items role=option in role=listbox, empty state 'Không tìm thấy kết quả.', ArrowUp/Down + Enter keyboard support, Escape via RAC dismissal. Close path resets query/highlight via a wrapped handleOpenChange (no setState-in-effect).

## Verification (from frontend/)

1. `npx tsc -b` — clean, exit 0 (no output).
2. `pnpm lint` — 0 errors, 22 warnings, all pre-existing (react-refresh only-export-components on provider/context files, exhaustive-deps, babel compilation skips in features/*). None in the 10 owned files.
3. `node scripts/guard-design-tokens.mjs` — clean.
4. `pnpm vitest run src/components/config-drawer.test.tsx src/context/search-provider.test.tsx --update` — **18/18 passed (2 files)**, no screenshots needed regeneration.
5. `curl http://localhost:5174/` — 200.
6. Constraint grep: zero lucide-react / ui/* imports across the 10 files.

## API Mismatches / Deviations Found in UUI

- RAC overlay triggers do NOT compose as JSX siblings here: `<DialogTrigger><Button/></DialogTrigger><ModalOverlay/>` renders the button with aria-expanded=true but the overlay never mounts. UUI's own pattern (multi-select, slideout) nests the overlay INSIDE the trigger; I followed that in config-drawer and notification-bell. Standalone controlled ModalOverlay (no trigger) works fine, used by MobileSidebar and CommandMenu.
- RAC Radio was unusable for the config drawer cards: it renders a visually hidden input, so the tests' `data-state="checked"` assertion and exact anchored accessible names ('Chọn lồng', /^chọn thanh bên$/) couldn't be satisfied; replaced with role=radio card buttons, which also restored direct click targets.
- `PopoverTrigger` is not exported by the installed react-aria-components; used DialogTrigger + Popover for NotificationBell.
- UUI Dropdown has no destructive item styling; 'Đăng xuất' uses the standard item style.
- LayoutConfig radio semantics preserved with the new model: radioState = offcanvas if collapsible==='offcanvas', else 'icon' when collapsed, else 'default'; 'Mặc định' also resets collapsible to 'icon' so the static sidebar returns from offcanvas mode.

## Notes

- config-drawer reads sidebar UI state via a local `useOptionalSidebarUI`: inside the shell it uses the real context; outside it falls back to local state mirrored with the sidebar_state cookie (needed because config-drawer.test.tsx renders without SidebarUIProvider, which I cannot edit). The try/catch hook read is lint-suppressed with a documented comment (hook order is stable per instance).
- Header/footer: no /settings route found, so no Settings footer link was added.

Status: DONE
