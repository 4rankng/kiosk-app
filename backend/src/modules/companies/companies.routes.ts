/**
 * Companies (customer groups). Each owns a price list.
 * GET    /api/companies
 * GET    /api/companies/:id
 * POST   /api/companies
 * PATCH  /api/companies/:id
 * DELETE /api/companies/:id
 */
import { Hono } from 'hono'
import { companyCreateSchema as createSchema, companyUpdateSchema as updateSchema } from '@kiosk/shared'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../../middleware/auth.js'
import { anyRole } from '../../middleware/rbac.js'
import { ok, created, paginated } from '../../lib/response.js'
import { parsePagination } from '../../lib/pagination.js'
import { companyService } from './companies.service.js'

export const companyRoutes = new Hono()
companyRoutes.use('*', requireAuth, anyRole)

// createSchema / updateSchema are imported from @kiosk/shared (single source of truth)

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
