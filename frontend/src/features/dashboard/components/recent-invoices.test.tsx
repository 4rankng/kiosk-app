import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getDashboardStats, type DashboardStats } from '@/services/reports'
import { RecentInvoices } from './recent-invoices'

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
    topProducts: [],
    topCustomers: [],
    yesterdayRevenue: 4_000_000,
    yesterdayOrders: 10,
    outstandingDebts: [],
    recentInvoices: [
      { code: 'HD0001', customerName: 'Quán Cô Ba', total: 1_250_000, status: 'completed', isPaid: true, date: '2026-09-26T09:30:00.000Z' },
      { code: 'HD0002', customerName: 'Nhà hàng Hoa Sữa', total: 2_000_000, status: 'pending', isPaid: false, date: '2026-09-26T10:15:00.000Z' },
      { code: 'HD0003', customerName: 'Chợ Bến Thành', total: 500_000, status: 'cancelled', isPaid: false, date: '2026-09-26T11:00:00.000Z' },
      { code: 'HD0004', customerName: 'Quán Bè Xôi', total: 750_000, status: 'completed', isPaid: false, date: '2026-09-26T12:45:00.000Z' },
    ],
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

describe('RecentInvoices', () => {
  it('shows the widget skeleton while loading', async () => {
    mockedGetStats.mockReturnValue(never())
    const screen = await renderWidget(<RecentInvoices />)

    await expect.element(screen.getByText('Hóa đơn gần đây')).toBeInTheDocument()
    const pulses = document.querySelectorAll('.animate-pulse')
    expect(pulses.length).toBeGreaterThan(0)
  })

  it('shows the error state with retry', async () => {
    mockedGetStats.mockRejectedValueOnce(new Error('boom'))
    const screen = await renderWidget(<RecentInvoices />)

    await expect
      .element(screen.getByText('Không tải được danh sách hóa đơn.'))
      .toBeInTheDocument()
  })

  it('shows the empty state when there are no recent invoices', async () => {
    mockedGetStats.mockResolvedValue(makeStats({ recentInvoices: [] }))
    const screen = await renderWidget(<RecentInvoices />)

    await expect.element(screen.getByText('Chưa có hóa đơn')).toBeInTheDocument()
  })

  it('renders rows with status badges, formatted totals and vi-VN time', async () => {
    mockedGetStats.mockResolvedValue(makeStats())
    const screen = await renderWidget(<RecentInvoices />)

    await expect.element(screen.getByText('HD0001')).toBeInTheDocument()
    await expect.element(screen.getByText('HD0002')).toBeInTheDocument()
    await expect.element(screen.getByText('HD0003')).toBeInTheDocument()
    await expect.element(screen.getByText('HD0004')).toBeInTheDocument()
    await expect.element(screen.getByText('1.250.000 đ')).toBeInTheDocument()

    await expect.element(screen.getByText('Đã TT').first()).toBeInTheDocument()
    await expect.element(screen.getByText('Chờ TT')).toBeInTheDocument()
    await expect.element(screen.getByText('Đã hủy')).toBeInTheDocument()
    await expect.element(screen.getByText('Chưa TT').first()).toBeInTheDocument()

    const cancelledRow = screen.getByText('HD0003').element().closest('div')
    expect(cancelledRow?.className).toContain('opacity-50')

    const expected = new Date('2026-09-26T09:30:00.000Z').toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })
    await expect.element(screen.getByText(expected)).toBeInTheDocument()
  })
})
