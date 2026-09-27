import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getDashboardStats, type DashboardStats } from '@/services/reports'
import { computeTodayStatsSummary, TodayStats } from './today-stats'

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

async function renderStats() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return await render(
    <QueryClientProvider client={queryClient}>
      <TodayStats />
    </QueryClientProvider>
  )
}

describe('TodayStats', () => {
  it('shows the skeleton grid while loading', async () => {
    mockedGetStats.mockReturnValue(never())
    const { container } = await renderStats()
    expect(container.querySelectorAll('.animate-pulse').length).toBe(16)
  })

  it('shows the error state with retry', async () => {
    mockedGetStats.mockRejectedValueOnce(new Error('boom'))
    const screen = await renderStats()
    await expect
      .element(screen.getByRole('alert'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('Không tải được thống kê'))
      .toBeInTheDocument()
  })

  it('renders the four stat cards with formatted values', async () => {
    mockedGetStats.mockResolvedValue(makeStats())
    const screen = await renderStats()

    await expect.element(screen.getByText('Doanh thu')).toBeInTheDocument()
    await expect.element(screen.getByText('Đơn hàng')).toBeInTheDocument()
    await expect.element(screen.getByText('Đã thanh toán')).toBeInTheDocument()
    await expect.element(screen.getByText('Còn nợ')).toBeInTheDocument()
    await expect.element(screen.getByText('5.000.000 đ')).toBeInTheDocument()
    await expect.element(screen.getByText('12')).toBeInTheDocument()
    await expect.element(screen.getByText('4.000.000 đ')).toBeInTheDocument()
    await expect.element(screen.getByText('3.450.000 đ')).toBeInTheDocument()
  })

  it('renders trend subtitles from yesterday comparison', async () => {
    mockedGetStats.mockResolvedValue(makeStats())
    const screen = await renderStats()

    await expect.element(screen.getByText('+25.0% vs hôm qua')).toBeInTheDocument()
    await expect.element(screen.getByText('+2 vs hôm qua')).toBeInTheDocument()
    await expect.element(screen.getByText('80.0% tỷ lệ thu')).toBeInTheDocument()
    await expect.element(screen.getByText('2 khách nợ')).toBeInTheDocument()
  })

  it('renders the muted zero trend when there is no yesterday baseline', async () => {
    mockedGetStats.mockResolvedValue(makeStats({ yesterdayRevenue: 0, yesterdayOrders: 0 }))
    const screen = await renderStats()

    await expect
      .element(screen.getByText('— 0 vs hôm qua').first())
      .toBeInTheDocument()
  })
})

describe('computeTodayStatsSummary', () => {
  it('derives formatted values and trends from stats', () => {
    const summary = computeTodayStatsSummary(makeStats())
    expect(summary.values).toEqual({
      revenue: '5.000.000 đ',
      orders: '12',
      paid: '4.000.000 đ',
      unpaid: '3.450.000 đ',
    })
    expect(summary.revenueTrend).toBe('25.0')
    expect(summary.orderTrend).toBe(2)
    expect(summary.collectionRate).toBe('80.0')
    expect(summary.debtorCount).toBe(2)
  })

  it('falls back to zero baselines when stats are missing', () => {
    const summary = computeTodayStatsSummary(undefined)
    expect(summary.values.revenue).toBe('0 đ')
    expect(summary.revenueTrend).toBeNull()
    expect(summary.orderTrend).toBeNull()
    expect(summary.collectionRate).toBeNull()
    expect(summary.debtorCount).toBe(0)
  })
})
