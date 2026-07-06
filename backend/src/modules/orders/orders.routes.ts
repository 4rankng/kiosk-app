/**
 * Orders — list, get, create, update status, record payment.
 *
 * Create flow:
 *   1. Validate customer + business entity
 *   2. For each item, resolve final unitPrice:
 *        body.unitPrice (manual override) →
 *        customer.company.priceList.items[productId].customPrice →
 *        general price list item →
 *        product.defaultSalePrice
 *   3. Compute subtotal, total
 *   4. Insert order + items + (optional) initial payment + invoice in 1 TX
 *   5. Generate order code (DH000001, …) and invoice code (HD000001, …)
 */
import { Hono } from 'hono'
import { z } from 'zod'
import { orderCreateSchema as createSchema, orderStatusSchema as statusSchema, orderPaymentSchema as paymentSchema } from '@kiosk/shared'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../../middleware/auth.js'
import { anyRole } from '../../middleware/rbac.js'
import { ok, created, paginated } from '../../lib/response.js'
import { parsePagination } from '../../lib/pagination.js'
import { orderService } from './orders.service.js'

export const orderRoutes = new Hono()
orderRoutes.use('*', requireAuth, anyRole)

// createSchema / statusSchema / paymentSchema are imported from @kiosk/shared.
// orderStatusFilter is reused for the GET ?status= query param.
const orderStatusFilter = z.enum(['draft', 'confirmed', 'completed', 'cancelled'])

orderRoutes.get('/', async (c) => {
  const { page, pageSize, offset, q } = parsePagination(c)
  const rawStatus = c.req.query('status')
  const status = rawStatus ? orderStatusFilter.parse(rawStatus) : undefined
  const customerId = c.req.query('customerId')
  const companyId = c.req.query('companyId')
  const from = c.req.query('from')
  const to = c.req.query('to')
  const { items, total } = await orderService.list({ page, pageSize, offset, q, status, customerId, companyId, from, to })
  return paginated(c, items, total, page, pageSize)
})

orderRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')!
  const data = await orderService.getById(id)
  return ok(c, data)
})

orderRoutes.post('/', zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json')
  const user = c.get('user')
  const data = await orderService.create(body, user.sub)
  return created(c, data)
})

orderRoutes.patch('/:id/status', zValidator('json', statusSchema), async (c) => {
  const id = c.req.param('id')!
  const { status } = c.req.valid('json')
  const result = await orderService.updateStatus(id, status)
  return ok(c, result)
})

orderRoutes.post('/:id/payments', zValidator('json', paymentSchema), async (c) => {
  const id = c.req.param('id')!
  const payload = c.req.valid('json')
  const user = c.get('user')
  const result = await orderService.recordPayment(id, payload, user.sub)
  return created(c, result)
})
