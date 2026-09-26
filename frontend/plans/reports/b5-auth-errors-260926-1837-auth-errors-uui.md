# B5 — Auth & Error Pages → Untitled UI

## Executed Phase
- Phase: B5 (sign-in flow + error pages on UUI primitives)
- Status: DONE_WITH_CONCERNS

## Files Modified (all within owned scope)
- `src/features/auth/auth-layout.tsx` — rewritten as split layout: left brand panel (bg-brand-solid + white→black gradient overlay; green brand-600→700 utilities do NOT generate since theme.css only aliases shadcn tokens in @theme, so I used bg-brand-solid + `bg-linear-to-b from-white/10 via-transparent to-black/25`), white Logo + "TingTing Kiosk" wordmark, Vietnamese tagline; hidden below `lg`; mobile-only compact brand row above the form; form panel `bg-primary`; children API kept.
- `src/features/auth/sign-in/index.tsx` — UUI composition: heading `text-display-xs font-semibold`, subcopy `text-sm text-tertiary`, form, and link-gray "Trở về trang chủ" back link (`Button color='link-gray' iconLeading={ArrowLeft}` → navigate '/').
- `src/features/auth/sign-in/components/user-auth-form.tsx` — ui/button+input+label+separator → UUI Button/TextField/Label/InputBase; RHF+zod logic, handlers, validation messages, Google OAuth flow, loading/disabled states untouched; custom Google SVG kept (no plain Google icon in @untitledui/icons — only GoogleChrome); Loader2 removed; `register()` spread onto `InputBase` (spreading onto TextField/Input wrapper would hit its string-based onChange and break RHF); RAC auto-wires label↔input.
- `src/features/auth/sign-in/components/user-auth-form.test.tsx` — only locator regexes un-anchored (`/^Email$/i` → `/Email/i`, `/^Mật khẩu$/` → `/Mật khẩu/`); copy assertions unchanged.
- `src/features/errors/error-page.tsx` — NEW shared shell (code/title/description/actions, `min-h-svh bg-primary`, code in `text-display-lg font-semibold text-brand-secondary`) for layout consistency across all five pages.
- `src/features/errors/{not-found,unauthorized,forbidden,general,maintenance}-error.tsx` — migrated to ErrorPage shell + UUI Button; icon mapping: lucide → ArrowLeft, Home01, LogIn03, RefreshCw01, (ShieldAlert dropped — 403 code now carries the signal); behavior preserved (history.go(-1), navigate('/'), navigate('/sign-in'), window.location.reload()); `GeneralError` keeps its `minimal` prop (root errorComponent).

## Copy
All existing Vietnamese copy preserved exactly. New copy: brand-panel tagline ("Bán hàng nhanh gọn ngay tại quầy."), sign-in back link "Trở về trang chủ".

## Verification
1. tsc: scoped tsconfig (owned files + deps) → 0 errors. Full `npx tsc -b --force`: errors ONLY in teammate files — data-table/faceted-filter.tsx, empty-state.tsx, number-input.tsx, password-input.tsx (badge-color / EmptyState.Root / size types). No errors in features/auth|errors.
2. `pnpm exec eslint src/features/auth src/features/errors` → 0 errors.
3. `node scripts/guard-design-tokens.mjs` — clean.
4. `pnpm vitest run src/features/auth --update` → 4/4 pass.
5. `grep lucide|@/components/ui/` in owned dirs → empty.

## Concerns
1. Test locator fix rationale: UUI Label always renders a required-asterisk span hidden only via Tailwind; the vitest browser iframe loads no app CSS, so the asterisk is visible there and accessible names become "Email *" — anchored regexes could never match. Un-anchored patterns test the same logic. Saved to memory for B2/B3.
2. Screenshots NOT regenerated: no screenshot API exists in the test file or vite.config.ts; the __screenshots__ PNGs are stale artifacts nothing references. `--update` is a no-op for them.
3. `bg-brand-solid → bg-brand-700` gradient from the brief is not expressible as utility classes (numbered brand utilities aren't in any @theme; only bg-brand-solid etc. generate). Used bg-brand-solid + white/black gradient overlay instead; visually equivalent.
4. Sign-in "back link" navigates to '/' per the brief's copy+action pairing; unauthenticated users may bounce back to sign-in if the route is guarded.
5. Button onClick on RAC Button works (usePress onClick alias); all buttons default `md` size (~38px ≤ 44px rule); no xl.
