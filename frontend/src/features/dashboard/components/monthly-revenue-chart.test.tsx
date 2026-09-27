import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getDashboardStats, type DashboardStats } from '@/services/reports'
import { MonthlyRevenueChart } from './monthly-revenue-chart'

vi.mock('@/services/reports', () => ({ getDashboardStats: vi.fn() }))

const mockedGetStats = vi.mocked(getDashboardStats)

function makeStats(overrides: Partial<DashboardStats> = {}): DashboardStats {
  return {
    todayRevenue: 5_000_000,
    todayOrders: 12,
    todayPending: 0,
    todayPaid: 4_000_000,
    todayUnpaid: 3_450_000,
    monthlyRevenue: [
      { week: 'Tuần 1', revenue: 2_000_000 },
      { week: 'Tuần 2', revenue: 3_000_000 },
    ],
    topProducts: [],
    topCustomers: [],
    yesterdayRevenue: 4_000_000,
    yesterdayOrders: 10,
    outstandingDebts: [],
    recentInvoices: [],
    ...overrides,
  }
}

function never<T>(): Promise<T> {
  return new Promise(() => {})
}

async function renderChart() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return await render(
    <QueryClientProvider client={queryClient}>
      <MonthlyRevenueChart />
    </QueryClientProvider>
  )
}

describe('MonthlyRevenueChart', () => {
  it('shows the skeleton while loading', async () => {
    mockedGetStats.mockReturnValue(never())
    const { container } = await renderChart()
    const pulses = container.querySelectorAll('.animate-pulse')
    expect(pulses.length).toBe(1)
  })

  it('shows the error state with retry', async () => {
    mockedGetStats.mockRejectedValueOnce(new Error('boom'))
    const screen = await renderChart()

    await expect
      .element(screen.getByText('Không tải được dữ liệu biểu đồ.'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByRole('button', { name: 'Thử lại' }))
      .toBeInTheDocument()
  })

  it('shows the empty state when the month has no revenue', async () => {
    mockedGetStats.mockResolvedValue(makeStats({
      monthlyRevenue: [
        { week: 'Tuần 1', revenue: 0 },
        { week: 'Tuần 2', revenue: 0 },
      ],
    }))
    const screen = await renderChart()

    await expect.element(screen.getByText('Chưa có doanh thu')).toBeInTheDocument()
    await expect
      .element(screen.getByText('Dữ liệu sẽ xuất hiện khi có đơn hàng trong tháng'))
      .toBeInTheDocument()
  })
  // The with-data path renders recharts through a lazy chunk, which is not
  // deterministic under the browser test runner (dep-optimizer reload + invalid
  // hook call during chunk load). The data mapping is covered by the pure
  // helper test in monthly-revenue-chart-data.test.ts instead.
})
