/**
 * Companies (customer groups). Each owns a price list.
 * GET    /api/companies
 * GET    /api/companies/:id
 * POST   /api/companies
 * PATCH  /api/companies/:id
 * DELETE /api/companies/:id
 */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../../middleware/auth.js'
import { anyRole } from '../../middleware/rbac.js'
import { ok, created, paginated } from '../../lib/response.js'
import { parsePagination } from '../../lib/pagination.js'
import { companyService } from './companies.service.js'

export const companyRoutes = new Hono()
companyRoutes.use('*', requireAuth, anyRole)

const baseSchema = z.object({
  name: z.string().min(1).max(160),
  taxCode: z.string().optional(),
  priceListId: z.string().uuid().nullable().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
})

const createSchema = baseSchema
const updateSchema = baseSchema.partial()

companyRoutes.get('/', async (c) => {
  const { page, pageSize, offset, q } = parsePagination(c)
  const { items, total } = await companyService.list({ page, pageSize, offset, q })
  return paginated(c, items, total, page, pageSize)
})

companyRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')!
  const row = await companyService.getById(id)
  return ok(c, row)
})

companyRoutes.post('/', zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json')
  const row = await companyService.create(body)
  return created(c, row)
})

companyRoutes.patch('/:id', zValidator('json', updateSchema), async (c) => {
  const id = c.req.param('id')!
  const body = c.req.valid('json')
  const row = await companyService.update(id, body)
  return ok(c, row)
})

companyRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id')!
  const result = await companyService.remove(id)
  return ok(c, result)
})
