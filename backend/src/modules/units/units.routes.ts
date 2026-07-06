/**
 * Units — flat list, inline-create friendly.
 * GET    /api/units
 * POST   /api/units
 * DELETE /api/units/:id
 */
import { Hono } from 'hono'
import { unitCreateSchema as createSchema } from '@kiosk/shared'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../../middleware/auth.js'
import { adminOnly, anyRole } from '../../middleware/rbac.js'
import { ok, created } from '../../lib/response.js'
import { unitService } from './units.service.js'

export const unitRoutes = new Hono()
unitRoutes.use('*', requireAuth, anyRole)

// createSchema is imported from @kiosk/shared (single source of truth)

unitRoutes.get('/', async (c) => {
  const rows = await unitService.list()
  return ok(c, rows)
})

unitRoutes.post('/', adminOnly, zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json')
  const row = await unitService.create(body)
  return created(c, row)
})

unitRoutes.delete('/:id', adminOnly, async (c) => {
  const id = c.req.param('id')!
  const result = await unitService.remove(id)
  return ok(c, result)
})
