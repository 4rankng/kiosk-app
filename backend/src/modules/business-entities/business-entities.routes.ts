/**
 * Business entities (Hộ kinh doanh templates).
 * GET    /api/business-entities
 * POST   /api/business-entities
 * PATCH  /api/business-entities/:id
 * DELETE /api/business-entities/:id
 */
import { Hono } from 'hono'
import { businessEntityCreateSchema as createSchema, businessEntityUpdateSchema as updateSchema } from '@kiosk/shared'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../../middleware/auth.js'
import { adminOnly, anyRole } from '../../middleware/rbac.js'
import { ok, created } from '../../lib/response.js'
import { businessEntityService } from './business-entities.service.js'

export const businessEntityRoutes = new Hono()
businessEntityRoutes.use('*', requireAuth, anyRole)

// createSchema / updateSchema are imported from @kiosk/shared (single source of truth)

businessEntityRoutes.get('/', async (c) => {
  const rows = await businessEntityService.list()
  return ok(c, rows)
})

businessEntityRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')!
  const row = await businessEntityService.getById(id)
  return ok(c, row)
})

businessEntityRoutes.post('/', adminOnly, zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json')
  const row = await businessEntityService.create(body)
  return created(c, row)
})

businessEntityRoutes.patch('/:id', adminOnly, zValidator('json', updateSchema), async (c) => {
  const id = c.req.param('id')!
  const body = c.req.valid('json')
  const row = await businessEntityService.update(id, body)
  return ok(c, row)
})

businessEntityRoutes.delete('/:id', adminOnly, async (c) => {
  const id = c.req.param('id')!
  const result = await businessEntityService.remove(id)
  return ok(c, result)
})
