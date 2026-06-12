/**
 * Customers (branches). Belong to a company; inherit the company's price list.
 * GET    /api/customers
 * GET    /api/customers/:id        — includes priceListId for client-side price resolution
 * POST   /api/customers
 * PATCH  /api/customers/:id
 * DELETE /api/customers/:id
 */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../../middleware/auth.js'
import { anyRole } from '../../middleware/rbac.js'
import { ok, created, paginated } from '../../lib/response.js'
import { parsePagination } from '../../lib/pagination.js'
import { customerService } from './customers.service.js'

export const customerRoutes = new Hono()
customerRoutes.use('*', requireAuth, anyRole)

const baseSchema = z.object({
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(160),
  companyId: z.string().uuid(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  taxId: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

const createSchema = baseSchema
const updateSchema = baseSchema.partial().omit({ companyId: true })

customerRoutes.get('/', async (c) => {
  const { page, pageSize, offset, q } = parsePagination(c)
  const companyId = c.req.query('companyId')
  const { items, total } = await customerService.list({ page, pageSize, offset, q, companyId })
  return paginated(c, items, total, page, pageSize)
})

customerRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')!
  const row = await customerService.getById(id)
  return ok(c, row)
})

customerRoutes.post('/', zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json')
  const row = await customerService.create(body)
  return created(c, row)
})

customerRoutes.patch('/:id', zValidator('json', updateSchema), async (c) => {
  const id = c.req.param('id')!
  const body = c.req.valid('json')
  const row = await customerService.update(id, body)
  return ok(c, row)
})

customerRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id')!
  const result = await customerService.remove(id)
  return ok(c, result)
})
