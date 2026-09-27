import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getDashboardStats, type DashboardStats } from '@/services/reports'
import { TopCustomers } from './top-customers'

vi.mock('@/services/reports', () => ({ getDashboardStats: vi.fn() }))

const mockedGetStats = vi.mocked(getDashboardStats)

function makeStats(overrides: Partial<DashboardStats> = {}): DashboardStats {
  return {
    todayRevenue: 5_000_000,
    todayOrders: 12,
    todayPending: 0,
    todayPaid: 4_000_000,
    todayUnpaid: 3_450_000,
    monthlyRevenue: [{ week: 'Tuần 1', revenue: 2_000_000 }],
    topProducts: [{ rank: 1, name: 'Cá hồi Na Uy', unit: 'kg', quantity: 120, revenue: 6_000_000 }],
    topCustomers: [
      { rank: 1, name: 'Quán Cô Ba', revenue: 12_500_000 },
      { rank: 2, name: 'Nhà hàng Hoa Sữa', revenue: 8_000_000 },
    ],
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

async function renderWidget(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return await render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('TopCustomers', () => {
  it('shows the widget skeleton while loading', async () => {
    mockedGetStats.mockReturnValue(never())
    const screen = await renderWidget(<TopCustomers />)

    await expect.element(screen.getByText('Khách hàng mua nhiều nhất')).toBeInTheDocument()
    const pulses = document.querySelectorAll('.animate-pulse')
    expect(pulses.length).toBeGreaterThan(0)
  })

  it('shows the error state with retry', async () => {
    mockedGetStats.mockRejectedValueOnce(new Error('boom'))
    const screen = await renderWidget(<TopCustomers />)

    await expect
      .element(screen.getByText('Không tải được danh sách khách hàng.'))
      .toBeInTheDocument()
  })

  it('shows the empty state when there is no customer data', async () => {
    mockedGetStats.mockResolvedValue(makeStats({ topCustomers: [] }))
    const screen = await renderWidget(<TopCustomers />)

    await expect.element(screen.getByText('Chưa có khách hàng')).toBeInTheDocument()
    await expect
      .element(screen.getByText('Dữ liệu sẽ xuất hiện khi có đơn hàng'))
      .toBeInTheDocument()
  })

  it('lists customers with rank, name and formatted revenue', async () => {
    mockedGetStats.mockResolvedValue(makeStats())
    const screen = await renderWidget(<TopCustomers />)

    await expect.element(screen.getByText('Quán Cô Ba')).toBeInTheDocument()
    await expect.element(screen.getByText('Nhà hàng Hoa Sữa')).toBeInTheDocument()
    await expect.element(screen.getByText('12.500.000 đ')).toBeInTheDocument()
    await expect.element(screen.getByText('8.000.000 đ')).toBeInTheDocument()
  })
})
