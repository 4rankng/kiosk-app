import { describe, it, expect, vi, beforeEach } from 'vitest'
import { orderService } from './orders.service.js'

/**
 * Characterization tests for orderService — lock the current behavior of the
 * list / status / payment flows with a fully mocked db client (no Postgres,
 * no Redis). The fake query builder records chained calls so tests can assert
 * on query shape (e.g. whether the count query joins customers) as well as on
 * outputs.
 */

interface FakeQuery {
  calls: Array<{ method: string; args: unknown[] }>
  from: (...args: unknown[]) => FakeQuery
  leftJoin: (...args: unknown[]) => FakeQuery
  where: (...args: unknown[]) => FakeQuery
  orderBy: (...args: unknown[]) => FakeQuery
  limit: (...args: unknown[]) => FakeQuery
  offset: (...args: unknown[]) => FakeQuery
  for: (...args: unknown[]) => FakeQuery
  set: (...args: unknown[]) => FakeQuery
  values: (...args: unknown[]) => FakeQuery
  returning: (...args: unknown[]) => FakeQuery
  then: (resolve: (value: unknown) => unknown, reject?: (err: unknown) => unknown) => Promise<unknown>
}

/** Chainable thenable fake of the Drizzle query builder; resolves to `result`. */
function fakeQuery(result: unknown): FakeQuery {
  const calls: FakeQuery['calls'] = []
  const query = { calls } as FakeQuery
  const record = (method: string) => (...args: unknown[]) => {
    calls.push({ method, args })
    return query
  }
  for (const method of ['from', 'leftJoin', 'where', 'orderBy', 'limit', 'offset', 'for', 'set', 'values', 'returning']) {
    ;(query as Record<string, unknown>)[method] = record(method)
  }
  query.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject)
  return query
}

const { mockDb, mockInvalidateDashboardCache, mockResolveEffectivePrices } = vi.hoisted(() => ({
  mockDb: {
    select: vi.fn(),
    update: vi.fn(),
    insert: vi.fn(),
    transaction: vi.fn(),
  },
  mockInvalidateDashboardCache: vi.fn(),
  mockResolveEffectivePrices: vi.fn(),
}))

vi.mock('../../config/db.js', () => ({ db: mockDb }))
vi.mock('../reports/reports.service.js', () => ({ invalidateDashboardCache: mockInvalidateDashboardCache }))
vi.mock('../../lib/price-lists.js', () => ({ resolveEffectivePrices: mockResolveEffectivePrices }))

describe('orderService.list', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const row = {
    id: 'o1',
    code: 'DH000001',
    customerId: 'c1',
    customerName: 'Khách A',
    companyId: 'co1',
    businessEntityId: 'b1',
    businessEntityName: 'Hộ KD 1',
    status: 'confirmed',
    subtotal: '100000',
    discount: '0',
    total: '100000',
    paidAmount: '50000',
    createdAt: new Date('2026-09-01T00:00:00Z'),
  }

  it('returns { items, total } with the count coerced to a number', async () => {
    mockDb.select
      .mockImplementationOnce(() => fakeQuery([row]))
      .mockImplementationOnce(() => fakeQuery([{ total: '7' }]))

    const result = await orderService.list({ page: 1, pageSize: 20, offset: 0 })

    expect(result).toEqual({ items: [row], total: 7 })
  })

  it('defaults total to 0 when the count query returns no row', async () => {
    mockDb.select
      .mockImplementationOnce(() => fakeQuery([]))
      .mockImplementationOnce(() => fakeQuery([]))

    const result = await orderService.list({ page: 1, pageSize: 20, offset: 40 })

    expect(result).toEqual({ items: [], total: 0 })
  })

  it('joins customers into the count query only when filtering by q or companyId', async () => {
    const queries: FakeQuery[] = []
    const enqueue = (result: unknown) => {
      const q = fakeQuery(result)
      queries.push(q)
      return q
    }
    const runList = async (params: Parameters<typeof orderService.list>[0]) => {
      queries.length = 0
      mockDb.select
        .mockImplementationOnce(() => enqueue([]))
        .mockImplementationOnce(() => enqueue([{ total: 0 }]))
      await orderService.list(params)
      return queries[1]!.calls.map((c) => c.method)
    }

    const withSearch = await runList({ page: 1, pageSize: 20, offset: 0, q: 'DH' })
    expect(withSearch).toContain('leftJoin')

    const plain = await runList({ page: 1, pageSize: 20, offset: 0 })
    expect(plain).not.toContain('leftJoin')
  })
})

describe('orderService.updateStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates the row and returns { id, status }', async () => {
    mockDb.update.mockImplementationOnce(() => fakeQuery([{ id: 'o1' }]))

    await expect(orderService.updateStatus('o1', 'completed')).resolves.toEqual({
      id: 'o1',
      status: 'completed',
    })
  })

  it('throws NotFound when the order does not exist', async () => {
    mockDb.update.mockImplementationOnce(() => fakeQuery([]))

    await expect(orderService.updateStatus('missing', 'cancelled')).rejects.toThrow(
      'Đơn hàng không tồn tại'
    )
  })
})

describe('orderService.recordPayment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mockTx(selectResult: unknown) {
    return {
      select: vi.fn(() => fakeQuery(selectResult)),
      insert: vi.fn(() => fakeQuery(undefined)),
      update: vi.fn(() => fakeQuery(undefined)),
    }
  }

  it('records the payment, updates order + invoice paid amounts, invalidates the dashboard cache', async () => {
    const tx = mockTx([{ id: 'o1', total: '100000', paidAmount: '40000' }])
    mockDb.transaction.mockImplementationOnce(async (cb: (t: unknown) => Promise<unknown>) => cb(tx))

    const result = await orderService.recordPayment('o1', { amount: 50000, method: 'cash' }, 'admin1')

    expect(result).toEqual({ paidAmount: 90000, remaining: 10000 })
    expect(mockInvalidateDashboardCache).toHaveBeenCalledOnce()

    const insertQ = tx.insert.mock.results[0]!.value as FakeQuery
    const valuesCall = insertQ.calls.find((c) => c.method === 'values')
    expect(valuesCall?.args[0]).toEqual({
      orderId: 'o1',
      amount: '50000',
      method: 'cash',
      note: null,
      createdBy: 'admin1',
    })
  })

  it('rejects when the new paid amount would exceed the order total', async () => {
    const tx = mockTx([{ id: 'o1', total: '100000', paidAmount: '0' }])
    mockDb.transaction.mockImplementationOnce(async (cb: (t: unknown) => Promise<unknown>) => cb(tx))

    await expect(
      orderService.recordPayment('o1', { amount: 100001, method: 'cash' }, 'admin1')
    ).rejects.toThrow('Tổng tiền thanh toán vượt quá tổng đơn')
    expect(tx.insert).not.toHaveBeenCalled()
  })

  it('throws NotFound when the order does not exist', async () => {
    const tx = mockTx([])
    mockDb.transaction.mockImplementationOnce(async (cb: (t: unknown) => Promise<unknown>) => cb(tx))

    await expect(
      orderService.recordPayment('missing', { amount: 1000, method: 'cash' }, 'admin1')
    ).rejects.toThrow('Đơn hàng không tồn tại')
  })
})
