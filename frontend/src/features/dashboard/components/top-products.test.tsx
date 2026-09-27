import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getDashboardStats, type DashboardStats } from '@/services/reports'
import { TopProducts } from './top-products'

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
    topProducts: [
      { rank: 1, name: 'Cá hồi Na Uy', unit: 'kg', quantity: 120, revenue: 6_000_000 },
      { rank: 2, name: 'Tôm thẻ', unit: 'kg', quantity: 80, revenue: 4_000_000 },
    ],
    topCustomers: [{ rank: 1, name: 'Quán Cô Ba', revenue: 12_500_000 }],
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

describe('TopProducts', () => {
  it('shows the widget skeleton while loading', async () => {
    mockedGetStats.mockReturnValue(never())
    const screen = await renderWidget(<TopProducts />)

    await expect.element(screen.getByText('Sản phẩm bán chạy')).toBeInTheDocument()
    const pulses = document.querySelectorAll('.animate-pulse')
    expect(pulses.length).toBeGreaterThan(0)
  })

  it('shows the error state with retry', async () => {
    mockedGetStats.mockRejectedValueOnce(new Error('boom'))
    const screen = await renderWidget(<TopProducts />)

    await expect
      .element(screen.getByText('Không tải được danh sách sản phẩm.'))
      .toBeInTheDocument()
  })

  it('shows the empty state when there are no product stats', async () => {
    mockedGetStats.mockResolvedValue(makeStats({ topProducts: [] }))
    const screen = await renderWidget(<TopProducts />)

    await expect.element(screen.getByText('Chưa có sản phẩm')).toBeInTheDocument()
    await expect
      .element(screen.getByText('Dữ liệu sẽ xuất hiện khi có đơn hàng'))
      .toBeInTheDocument()
  })

  it('lists products with quantities and units', async () => {
    mockedGetStats.mockResolvedValue(makeStats())
    const screen = await renderWidget(<TopProducts />)

    await expect.element(screen.getByText('Cá hồi Na Uy')).toBeInTheDocument()
    await expect.element(screen.getByText('Tôm thẻ')).toBeInTheDocument()
    await expect.element(screen.getByText('120 kg')).toBeInTheDocument()
    await expect.element(screen.getByText('80 kg')).toBeInTheDocument()
  })
})
