/**
 * Business entities (Hộ kinh doanh templates).
 * GET    /api/business-entities
 * POST   /api/business-entities
 * PATCH  /api/business-entities/:id
 * DELETE /api/business-entities/:id
 */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../../middleware/auth.js'
import { adminOnly, anyRole } from '../../middleware/rbac.js'
import { ok, created } from '../../lib/response.js'
import { businessEntityService } from './business-entities.service.js'

export const businessEntityRoutes = new Hono()
businessEntityRoutes.use('*', requireAuth, anyRole)

const createSchema = z.object({
  name: z.string().min(1).max(160),
  taxCode: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  headerLines: z.array(z.string().max(200)).max(20).default([]),
})

const updateSchema = createSchema.partial()

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
