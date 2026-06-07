# Dashboard Enhancement — Full Terminal Design

**Date:** 2026-06-08
**Status:** Approved
**Approach:** A — Full Terminal (maximum density)

## Goal

Fill the empty dashboard space with actionable business data: product performance, debt tracking, trend comparisons, and recent activity. Transform static "today's numbers" into a dense, informative terminal-style view.

## Current State

The dashboard (`src/features/dashboard/`) shows:
- 4 stat cards: Doanh thu, Đơn hàng, Đã thanh toán, Còn nợ
- Monthly revenue bar chart (4-week, `MonthlyRevenueChart`)
- Top 10 customers list (`TopCustomers`)

## Target Layout

```
Header: Search ─── NotificationBell ─── ProfileDropdown

"Tổng quan" / "Tình hình kinh doanh hôm nay."

ROW 1: 4 stat cards (grid sm:2 lg:4)
  └─ TodayStats — enhanced with trend indicators

ROW 2: Chart + Customers (grid lg:7)
  ├─ MonthlyRevenueChart (lg:col-span-4) — existing, unchanged
  └─ TopCustomers (lg:col-span-3) — existing, unchanged

ROW 3: Products + Debts (grid lg:7)
  ├─ TopProducts (lg:col-span-4) — NEW
  └─ OutstandingDebts (lg:col-span-3) — NEW

ROW 4: Recent Invoices (full width)
  └─ RecentInvoices — NEW
```

## Data Layer

### Extended `DashboardStats` interface

```typescript
export interface DashboardStats {
  // ── Existing (unchanged) ──
  todayRevenue: number
  todayOrders: number
  todayPending: number
  todayPaid: number
  todayUnpaid: number
  monthlyRevenue: { week: string; revenue: number }[]
  topCustomers: { rank: number; name: string; revenue: number }[]

  // ── NEW: Trend comparison ──
  yesterdayRevenue: number
  yesterdayOrders: number

  // ── NEW: Product performance ──
  topProducts: {
    rank: number
    name: string
    unit: string
    quantity: number
    revenue: number
  }[]

  // ── NEW: Outstanding debts ──
  outstandingDebts: {
    customerName: string
    amount: number
  }[]

  // ── NEW: Recent activity ──
  recentInvoices: {
    code: string
    customerName: string
    total: number
    status: InvoiceStatus
    isPaid: boolean
    date: string
  }[]
}
```

### Computation logic (all from existing `invoices` mock data)

**Trend comparison:**
- `yesterdayRevenue`: sum of completed invoices where `date.slice(0,10) === yesterday`
- `yesterdayOrders`: count of same
- Display logic: `((today - yesterday) / yesterday * 100)` — show as "+12.3%" or "-5.1%"
- If yesterday is 0, display "—" (no division by zero)

**Top products:**
- Filter current month's completed invoices
- Aggregate by `productId`, sum `quantity` and `total`
- Sort by quantity descending, take top 5
- Include `name`, `unit` from product data

**Outstanding debts:**
- Filter ALL invoices where `isPaid === false` and `status === 'completed'`
- Group by `customerId`, sum `(total - paidAmount)` per customer
- Sort by amount descending, take top 5
- Add total sum for footer

**Recent invoices:**
- Sort all invoices by `date` descending
- Take latest 5
- Include `code`, `customerName`, `total`, `status`, `isPaid`, `date`

## Component Design

### 1. Enhanced Stat Cards (`TodayStats`)

**Changes to existing component only — no new component.**

Each stat card gets a `<p>` element under the value:

| Card | Value | Subtitle text | Color logic |
|------|-------|--------------|-------------|
| Doanh thu | `formatCurrency(todayRevenue)` | `+X% vs hôm qua` or `-X% vs hôm qua` | Green if positive, red if negative, muted if zero/"—" |
| Đơn hàng | `formatNumber(todayOrders)` | `+N vs hôm qua` or `-N vs hôm qua` | Same color logic |
| Đã thanh toán | `formatCurrency(todayPaid)` | `X.X%` (collection rate = todayPaid/todayRevenue) | Always muted (informational) |
| Còn nợ | `formatCurrency(todayUnpaid)` | `N khách nợ` (count of distinct debtors) | Always muted |

Color implementation: `text-xs` base with conditional color class on the number portion:
- Positive trend: `text-emerald-600`
- Negative trend: `text-red-600`
- Neutral/info: `text-muted-foreground`

### 2. Top Products (`TopProducts`)

**File:** `src/features/dashboard/components/top-products.tsx`
**Pattern:** Card > CardHeader + CardContent > SimpleBarList

```
┌─ Sản phẩm bán chạy ────────────────┐
│ Tháng này                           │
│                                     │
│ Nước suối 6L     ████████████  120  │
│ Bia Saigon        █████████    85   │
│ Nước ngọt         ██████       62   │
│ Bia 333           ████         48   │
│ Nước suối 500ml   ███          35   │
└─────────────────────────────────────┘
```

- Title: "Sản phẩm bán chạy", Description: "Tháng này"
- SimpleBarList pattern: each item is a flex row with label, progress bar, value
- Progress bar: `h-2.5 rounded-full`, width proportional to max quantity
- Bar color: `bg-primary`
- Value: right-aligned, `tabular-nums`, format as `quantity unit`
- Max 5 items
- Loading state: 5 skeleton bars

### 3. Outstanding Debts (`OutstandingDebts`)

**File:** `src/features/dashboard/components/outstanding-debts.tsx`
**Pattern:** Card > CardHeader + CardContent > ranked list + footer

```
┌─ Công nợ ──────────────────────────┐
│ Khách hàng còn nợ                   │
│                                     │
│ 1. Nguyễn Văn An     2.350.000₫    │
│ 2. Lê Thị Bình       1.800.000₫    │
│ 3. Trần Văn Cường    1.200.000₫    │
│ 4. Phạm Thị Dung       850.000₫    │
│ 5. Hoàng Văn Em         420.000₫    │
│                                     │
│ ─────────────────────────────────── │
│ Tổng công nợ         6.620.000₫    │
└─────────────────────────────────────┘
```

- Title: "Công nợ", Description: "Khách hàng còn nợ"
- Ranked list: rank badge (same style as TopCustomers — `h-8 w-8 rounded-full bg-muted`), name, amount
- Amount: right-aligned, `formatCurrency`, `tabular-nums`, `font-medium`
- Footer: `border-t pt-3`, "Tổng công nợ" label + bold total amount
- Max 5 debtors
- Empty state: same pattern as TopCustomers (icon + "Không có công nợ")
- Loading state: skeleton rows

### 4. Recent Invoices (`RecentInvoices`)

**File:** `src/features/dashboard/components/recent-invoices.tsx`
**Pattern:** Card > CardHeader + CardContent > flex list

```
┌─ Hóa đơn gần đây ───────────────────────────────────────────┐
│                                                              │
│ INV-001  Nguyễn Văn An   5.231.800₫   ✓ Đã TT     14:30   │
│ INV-002  Lê Thị Bình     2.100.000₫   ⏳ Chờ TT    13:45   │
│ INV-003  Trần Văn Cường  1.850.000₫   ✓ Đã TT     11:20   │
│ INV-004  Phạm Thị Dung     450.000₫   ✗ Đã hủy    10:05   │
│ INV-005  Hoàng Văn Em    1.200.000₫   ✓ Đã TT     09:30   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

- Title: "Hóa đơn gần đây"
- Each row: flex with `divide-y border-b last:border-b-0`
- Columns: invoice code (`font-mono text-xs`), customer name (`truncate`), amount (`tabular-nums formatCurrency`), status badge, time
- Status display:
  - Paid (`isPaid === true`): `CheckCircle` icon, "Đã TT", `text-emerald-600`
  - Pending (`status === 'pending'`): `Clock` icon, "Chờ TT", `text-amber-600`
  - Cancelled (`status === 'cancelled'`): `XCircle` icon, "Đã hủy", `text-muted-foreground`
  - Completed but unpaid: `AlertCircle` icon, "Chưa TT", `text-red-600`
- Time: extracted from `date`, formatted as `HH:mm`
- Max 5 invoices
- Empty state: icon + "Chưa có hóa đơn"
- Loading state: skeleton rows

### 5. Dashboard Page (`index.tsx`)

Modified to add Row 3 + Row 4:

```tsx
<div className='space-y-4'>
  <TodayStats />
  <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
    <Card className='col-span-1 lg:col-span-4'>
      {/* MonthlyRevenueChart — existing */}
    </Card>
    <Card className='col-span-1 lg:col-span-3'>
      <TopCustomers />
    </Card>
  </div>
  <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
    <Card className='col-span-1 lg:col-span-4'>
      <TopProducts />
    </Card>
    <Card className='col-span-1 lg:col-span-3'>
      <OutstandingDebts />
    </Card>
  </div>
  <RecentInvoices />
</div>
```

## Files Changed

| Action | File | Description |
|--------|------|-------------|
| Modify | `src/services/reports.ts` | Extend `DashboardStats`, compute new fields |
| Modify | `src/features/dashboard/components/today-stats.tsx` | Add trend indicators |
| Modify | `src/features/dashboard/index.tsx` | Add Row 3 + Row 4 |
| Create | `src/features/dashboard/components/top-products.tsx` | Top 5 products bar list |
| Create | `src/features/dashboard/components/outstanding-debts.tsx` | Debtors ranked list with total |
| Create | `src/features/dashboard/components/recent-invoices.tsx` | Latest invoices with status |

**Total: 3 new files + 3 modified = 6 files**

## Design Constraints

- **Light theme only** — no dark mode classes needed
- **Vietnamese UI** — all labels in Vietnamese
- **Currency format** — `formatCurrency()` (VND, X.XXX format)
- **Number format** — `formatNumber()` for quantities
- **Chart colors** — `hsl(var(--chart-N))` CSS variables, no hardcoded colors
- **Icons** — lucide-react only, `text-muted-foreground` color
- **Stat cards** — no hover effects, no colored icon boxes, no borders
- **Skeleton loading** — every new component needs a loading skeleton state
- **Empty states** — every new component needs an empty state with icon + message

## Out of Scope

- Donut/pie charts for order status breakdown (can add later)
- Average order value stat card (can add later)
- Date range picker for dashboard filtering
- Drill-down interactions (clicking a customer to see their invoices)
- Mobile-specific layout changes (the grid already collapses via responsive classes)
