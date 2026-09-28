# kiosk-app — Test Plan

Owner: QA / dev
Last updated: 2026-09-28
Scope: `frontend` (React 19 SPA), `backend` (Hono API), `shared` (types/contracts)

This plan is written against the app as it actually is: 8 feature screens, 17 routes,
12 backend modules, 13 entity dialogs. It is meant to be executed by a human or an agent with
a browser, and every case is checkable against observable behaviour.

---

## 1. Environments and preflight

| Item | Value |
|---|---|
| App | `http://localhost:5174` (Vite dev) |
| API | `http://localhost:3000/api` |
| Start | `make dev` (docker postgres + redis, then `pnpm -r --parallel dev`) |
| Seed | `pnpm --filter backend db:seed` |
| Credentials | `admin@tingting.vn` / `Admin@123` |
| Frontend tests | `cd frontend && pnpm test` (vitest, headless Chromium) |
| Backend tests | `cd backend && pnpm test` |

**Preflight must pass before any UI case is trusted:**

```bash
pnpm lint          # eslint + design-token guard
pnpm typecheck     # tsc --noEmit
pnpm build         # tsc -b && vite build
cd frontend && pnpm test   # expect 216 tests / 37 files
cd backend  && pnpm test   # expect 35 tests / 6 files
```

> `pnpm lint:tokens` is part of `pnpm lint`. It bans palette-numbered colours, `dark:`
> variants, `text-xl`+, and Heroicons CSS. The app is light-only, 11/12px, 30–36px controls.

### Viewports

| Name | Size | Why |
|---|---|---|
| `mobile` | 390 × 844 | iPhone 14. The density contract and every layout branch change here. |
| `desktop` | 1440 × 900 | Default. Exercises the 12-column POS grid and sticky columns. |

Every visual case below must be checked at **both**.

---

## 2. Coverage matrix

| Flow | Mobile | Desktop | Tests | Kanban |
|---|---|---|---|---|
| F-01 Auth (sign in / sign out / session) | ✔ | ✔ | `user-auth-form`, `auth.service` | — |
| F-02 Dashboard | ✔ | ✔ | — | — |
| F-03 Products CRUD | ✔ | ✔ | — | FE-07 |
| F-04 Companies CRUD | ✔ | ✔ | — | — |
| F-05 Customers CRUD | ✔ | ✔ | `customers-table` | — |
| F-06 Price lists (edit prices, save) | ✔ | ✔ | `price-list-table` | — |
| F-07 Invoices (list, filter, print, pay) | ✔ | ✔ | — | FE-08 |
| F-08 **POS — create order** | ✔ | ✔ | `order-create` | FE-11 |
| F-09 Reports (customers debt, products) | ✔ | ✔ | — | FE-10 |
| F-10 Error pages (401/403/404/500/503) | ✔ | ✔ | — | FE-12 |

---

## 3. Regression cases (do not skip — each maps to a real defect)

These were all live bugs. They are silent when they regress, so they are asserted explicitly.

### R-01 · Money is never `NaN`
**Why:** every money column is `numeric(15,2)`; Drizzle returns those as **strings**. `+`
then concatenates instead of adding, so `0 + "30000.00" + "38000.00"` became
`"030000.0038000.00"` and the total rendered as a literal `NaN đ`.
*How:* F-08, add two products, assert the bar reads `68.000 đ`, open the review sheet, assert
`Tổng tiền hàng` and `Khách cần trả` are figures and the string `NaN` appears nowhere.
Also F-07 pay an invoice and assert the amount.

### R-02 · Creating an order must succeed
**Why:** `order_code_seq` started at 1 while the seed wrote `DH000001…`, so the first order
through the API hit `duplicate key value violates unique constraint "orders_code_key"`. The
whole POS workflow was dead.
*How:* F-08 end-to-end. The success dialog must show a code one higher than the last.

### R-03 · Server errors reach the user
**Why:** the interceptor rewrites `AxiosError` → `ApiError`, but `handleServerError` only read
`AxiosError`, so every failure showed an English "Something went wrong!".
*How:* force a failure (e.g. submit with an empty cart, or stop the backend) and assert the
toast is Vietnamese and names the actual cause.

### R-04 · The review sheet must be usable on a 390px screen
**Why:* the slideout had **no z-index** and only won by DOM order, losing to the fixed header
and the mobile total bar (both `z-40`) — the header painted over the sheet header and the
total bar covered "Đóng".
*How:* F-08 step 2 at `mobile`. Assert: sheet is full-width with no page showing at the left
edge; its own header is readable; **both** footer buttons are fully visible.

### R-05 · Vietnamese diacritics are never clipped
**Why:* the 11px scale's tight line-height cut the stacked diacritics in uppercase labels.
*How:* F-08 at `mobile` — "CƠ SỞ XUẤT PHIẾU IN:" renders whole. Sweep every uppercase label.

### R-06 · Long product names are readable
**Why:* a `shrink-0` price and `+` icon left the name ~20px, truncating to "Ba…".
*How:* F-08 at `mobile` — the category grid shows more than a 3-character stub.

---

## 4. Flow cases

### F-01 Auth
| # | Case | Expected |
|---|---|---|
| 1.1 | Load `/sign-in` | Card, email + password, Vietnamese copy |
| 1.2 | Wrong password | Vietnamese error, stays on the page |
| 1.3 | Valid credentials | Lands on `/`, sidebar visible |
| 1.4 | Deep-link an authed route while signed out | Redirected to `/sign-in?redirect=…`; returns after login |
| 1.5 | Sign out | Back to `/sign-in`; back button does not re-enter |
| 1.6 | Access token revoked mid-session | Silent refresh, or a clean redirect — never a spinner that hangs |

### F-02 Dashboard
| # | Case | Expected |
|---|---|---|
| 2.1 | Load | KPI row, revenue chart, top customers/products, debts, recent invoices |
| 2.2 | Zero data | Every widget shows its empty state, not a blank card |
| 2.3 | Debt alert | Appears only when debts exist; shows the sum; button routes to `/invoices` |
| 2.4 | Long customer names | Truncate with ellipsis; must not wrap or overflow |

### F-03/04/05 Products, Companies, Customers CRUD
| # | Case | Expected |
|---|---|---|
| n.1 | List | Search box, faceted filter, table; mobile shows cards |
| n.2 | Empty | Empty state with a route to create |
| n.3 | Add | Dialog validates required fields in Vietnamese |
| n.4 | Save | Row appears, toast confirms, list refreshes |
| n.5 | Edit | Form pre-filled with real values — **prices must be numbers, not `"20000.00"`** |
| n.6 | Delete | Confirm dialog; cancel leaves data intact |
| n.7 | API error | Vietnamese message naming the cause, not the generic fallback |

### F-06 Price lists
| # | Case | Expected |
|---|---|---|
| 6.1 | Auto-select | Default price list is selected on load |
| 6.2 | Edit a custom price | Input accepts digits; value is a number on save |
| 6.3 | Save | Mutation carries `customPrice` as a **number** |
| 6.4 | Mobile | Card layout; price input reachable and ≥30px |

### F-07 Invoices
| # | Case | Expected |
|---|---|---|
| 7.1 | List | Status badges colour-coded; legend present |
| 7.2 | Payment dialog | `Còn lại` = total − paid, as a figure |
| 7.3 | Pay in full | Badge flips to "Đã thanh toán" |
| 7.4 | Print | Document renders; **no `NaN`/`undefined`**, diacritics intact |
| 7.5 | Over-payment | Blocked with a Vietnamese message |

### F-08 POS — create order *(highest value flow)*
| # | Case | Expected |
|---|---|---|
| 8.1 | Load | Steps 1→2→3; step numbers match the task order |
| 8.2 | **Step order is identical on both viewports** | customer(1) → cart(2) → summary(3) |
| 8.3 | Pick a customer | Step 1 ticks; price list resolves to that customer |
| 8.4 | Prices are customer-specific | Not the generic `defaultSalePrice` |
| 8.5 | Add products | Step 2 ticks; count updates |
| 8.6 | Edit quantity / price | Line totals recompute; never `NaN` |
| 8.7 | Apply a discount | `Khách cần trả` = subtotal − discount |
| 8.8 | Submit empty | Blocked in Vietnamese, nothing sent |
| 8.9 | Submit | Success dialog with code, customer and total |
| 8.10 | Mobile review sheet | See R-04 |
| 8.11 | No business entity | Auto-selects, or blocks clearly |

### F-09 Reports
| # | Case | Expected |
|---|---|---|
| 9.1 | Load | Defaults to current month → today |
| 9.2 | Half-picked range | Ignored until both bounds exist |
| 9.3 | Apply | KPI row + table; figures are numbers |
| 9.4 | No data | Empty state inside the report shell |
| 9.5 | Export CSV | UTF-8 BOM; Vietnamese opens correctly in Excel |
| 9.6 | Export XLSX | File downloads; **ExcelJS**; Vietnamese intact |
| 9.7 | Company filter | Narrows results |

### F-10 Error pages
| # | Case | Expected |
|---|---|---|
| 10.1 | 401 / 403 / 404 / 500 / 503 | Distinct Vietnamese copy, working "back" affordance |

---

## 5. Visual standards

Checked on every visual change; `pnpm lint:tokens` enforces the first four automatically.

- **Tokens only** — `text-primary`, `border-secondary`, `bg-success-primary`. No
  `text-gray-600`, no `border-secondary-100`, no `bg-white`.
- **Light only** — no `dark:` anywhere.
- **Type** — `text-xs` (11px) and `text-sm`/`md`/`lg` (12px). `text-xl`+ is banned.
- **Icons** — `@untitledui/icons` only. No `lucide-react`, no Heroicons `hi-*` classes.
  Resolve names via the UntitledUI MCP's `search_icons`.
- **Density** — controls `h-7.5`/`h-8`/`h-9` (30/32/36px).
- **Money** — `formatCurrency` / `toNumber`. Never raw arithmetic on a money field.
- **Mobile** — the order review sheet is full-width; the app header must not overlap it.

**Useful in-page probe** (run after any UI change, on every screen):

```js
const body = document.body.innerText;
['NaN','undefined','[object Object]'].filter(s => body.includes(s))   // must be empty
const de = document.documentElement;
de.scrollWidth - de.clientWidth                                           // must be <= 1
```

---

## 6. Exit criteria

A change is done when:

1. All five preflight commands pass.
2. Every case in the touched flow is executed at **both** viewports.
3. `pnpm lint:tokens` exits 0 (it runs inside `pnpm lint`).
4. No `NaN` / `undefined` / `[object Object]` is visible in the touched screen.
5. The new defect, if any, is filed in `kanban/TODO/` before the PR is raised.
6. Existing tests are **never** weakened to make a change pass. If a test breaks, the change
   is wrong until proven otherwise.
