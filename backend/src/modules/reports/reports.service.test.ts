import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { reportService, invalidateDashboardCache } from './reports.service.js'

/**
 * Characterization tests for reportService — lock the current getDashboard
 * aggregation/mapping behavior and the cache invalidation hook with a mocked
 * db client and Redis cache helpers (no Postgres, no Redis). Time is frozen
 * so the "today / this month" aggregates are deterministic.
 */

const { mockDb, mockCacheGet, mockCacheSet, mockCacheDel } = vi.hoisted(() => ({
  mockDb: { execute: vi.fn() },
  mockCacheGet: vi.fn(),
  mockCacheSet: vi.fn(),
  mockCacheDel: vi.fn(),
}))

vi.mock('../../config/db.js', () => ({ db: mockDb }))
vi.mock('../../config/redis.js', () => ({
  cacheGet: mockCacheGet,
  cacheSet: mockCacheSet,
  cacheDel: mockCacheDel,
}))

/** Queue raw db.execute results for the dashboard's 9 aggregate queries, in order. */
function mockExecuteResults(results: Array<{ rows: unknown[] }>) {
  for (const r of results) mockDb.execute.mockResolvedValueOnce(r)
}

describe('reportService.getDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 8, 15, 10, 0, 0)) // 2026-09-15 10:00 local
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the cached object as-is without touching the db', async () => {
    const cached = { todayRevenue: 1, source: 'cache' }
    mockCacheGet.mockResolvedValueOnce(cached)

    const result = await reportService.getDashboard()

    expect(result).toBe(cached)
    expect(mockDb.execute).not.toHaveBeenCalled()
    expect(mockCacheSet).not.toHaveBeenCalled()
  })

  it('aggregates, maps and caches the dashboard payload on a cache miss', async () => {
    mockExecuteResults([
      { rows: [] }, // today agg missing → zeros
      { rows: [{ revenue: 500000, orders: 3 }] }, // yesterday
      { rows: [{ count: 2 }] }, // pending drafts
      { rows: [{ revenue: 999999 }] }, // month total (consumed but currently unused)
      {
        rows: [
          { week: new Date(2026, 8, 1), revenue: 100 },
          { week: new Date(2026, 8, 8), revenue: 250 },
        ],
      }, // weekly rows
      {
        rows: [
          { name: 'Khách A', revenue: 700 },
          { name: 'Khách B', revenue: 300 },
        ],
      }, // top customers
      {
        rows: [
          { name: 'Cà phê', unit: 'Gói', quantity: 12, revenue: 240000 },
          { name: 'Sữa', unit: null, quantity: '4.5', revenue: 90000 },
        ],
      }, // top products
      { rows: [{ customer_name: 'Khách B', amount: 320000 }] }, // outstanding debts
      {
        rows: [
          {
            code: 'HD000009',
            customer_name: 'Khách A',
            total: '50000',
            status: 'completed',
            is_paid: true,
            issued_at: '2026-09-15T03:00:00.000Z',
          },
        ],
      }, // recent invoices
    ])

    const result = await reportService.getDashboard()

    expect(result).toEqual({
      todayRevenue: 0,
      todayOrders: 0,
      todayPending: 2,
      todayPaid: 0,
      todayUnpaid: 0,
      yesterdayRevenue: 500000,
      yesterdayOrders: 3,
      monthlyRevenue: [
        { week: '01/09-07/09', revenue: 100 },
        { week: '08/09-14/09', revenue: 250 },
        { week: '15/09-21/09', revenue: 0 },
        { week: '22/09-28/09', revenue: 0 },
      ],
      topCustomers: [
        { rank: 1, name: 'Khách A', revenue: 700 },
        { rank: 2, name: 'Khách B', revenue: 300 },
      ],
      topProducts: [
        { rank: 1, name: 'Cà phê', unit: 'Gói', quantity: 12, revenue: 240000 },
        { rank: 2, name: 'Sữa', unit: '', quantity: 4.5, revenue: 90000 },
      ],
      outstandingDebts: [{ customerName: 'Khách B', amount: 320000 }],
      recentInvoices: [
        {
          code: 'HD000009',
          customerName: 'Khách A',
          total: 50000,
          status: 'completed',
          isPaid: true,
          date: '2026-09-15T03:00:00.000Z',
        },
      ],
    })
    expect(mockCacheSet).toHaveBeenCalledOnce()
    expect(mockCacheSet).toHaveBeenCalledWith('cache:dashboard', result, 45)
  })

  it('coerces string aggregates coming back from pg through Number()', async () => {
    mockExecuteResults([
      { rows: [{ revenue: '1234.5', orders: '8', paid: '1000', unpaid: '234.5' }] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
    ])

    const result = await reportService.getDashboard()

    expect(result).toMatchObject({
      todayRevenue: 1234.5,
      todayOrders: 8,
      todayPaid: 1000,
      todayUnpaid: 234.5,
      yesterdayRevenue: 0,
      yesterdayOrders: 0,
    })
  })
})

describe('invalidateDashboardCache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes the dashboard cache key', async () => {
    await invalidateDashboardCache()
    expect(mockCacheDel).toHaveBeenCalledOnce()
    expect(mockCacheDel).toHaveBeenCalledWith('cache:dashboard')
  })
})
