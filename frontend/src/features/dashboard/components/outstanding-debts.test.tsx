import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getDashboardStats, type DashboardStats } from '@/services/reports'
import { OutstandingDebts } from './outstanding-debts'

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
    topCustomers: [{ rank: 1, name: 'Quán Cô Ba', revenue: 12_500_000 }],
    yesterdayRevenue: 4_000_000,
    yesterdayOrders: 10,
    topProducts: [{ rank: 1, name: 'Cá hồi Na Uy', unit: 'kg', quantity: 120, revenue: 6_000_000 }],
    outstandingDebts: [
      { customerName: 'Quán Cô Ba', amount: 1_250_000 },
      { customerName: 'Nhà hàng Hoa Sữa', amount: 800_000 },
    ],
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

describe('OutstandingDebts', () => {
  it('shows the widget skeleton while loading', async () => {
    mockedGetStats.mockReturnValue(never())
    const screen = await renderWidget(<OutstandingDebts />)

    await expect.element(screen.getByText('Công nợ')).toBeInTheDocument()
    const pulses = document.querySelectorAll('.animate-pulse')
    expect(pulses.length).toBeGreaterThan(0)
  })

  it('shows the error state with retry', async () => {
    mockedGetStats.mockRejectedValueOnce(new Error('boom'))
    const screen = await renderWidget(<OutstandingDebts />)

    await expect
      .element(screen.getByText('Không tải được danh sách công nợ.'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByRole('button', { name: 'Thử lại' }))
      .toBeInTheDocument()
  })

  it('shows the empty state when there are no debts', async () => {
    mockedGetStats.mockResolvedValue(makeStats({ outstandingDebts: [] }))
    const screen = await renderWidget(<OutstandingDebts />)

    await expect.element(screen.getByText('Không có công nợ')).toBeInTheDocument()
    await expect
      .element(screen.getByText('Tất cả hóa đơn đã thanh toán'))
      .toBeInTheDocument()
  })

  it('lists debts with formatted amounts and the total', async () => {
    mockedGetStats.mockResolvedValue(makeStats())
    const screen = await renderWidget(<OutstandingDebts />)

    await expect.element(screen.getByText('Quán Cô Ba')).toBeInTheDocument()
    await expect.element(screen.getByText('Nhà hàng Hoa Sữa')).toBeInTheDocument()
    await expect.element(screen.getByText('1.250.000 đ')).toBeInTheDocument()
    await expect.element(screen.getByText('800.000 đ')).toBeInTheDocument()
    await expect.element(screen.getByText('Tổng công nợ')).toBeInTheDocument()
    await expect.element(screen.getByText('2.050.000 đ')).toBeInTheDocument()
  })
})
