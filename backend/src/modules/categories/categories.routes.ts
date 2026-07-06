/**
 * Categories — self-referencing tree. Read returns nested tree; write is flat.
 * GET    /api/categories       — returns full tree
 * POST   /api/categories       — create (inline-create friendly)
 * PATCH  /api/categories/:id   — rename / re-parent
 * DELETE /api/categories/:id   — refuses if products or children exist
 */
import { Hono } from 'hono'
import { categoryCreateSchema as createSchema, categoryUpdateSchema as updateSchema } from '@kiosk/shared'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../../middleware/auth.js'
import { adminOnly, anyRole } from '../../middleware/rbac.js'
import { ok, created } from '../../lib/response.js'
import { categoryService } from './categories.service.js'

export const categoryRoutes = new Hono()
categoryRoutes.use('*', requireAuth, anyRole)

// createSchema / updateSchema are imported from @kiosk/shared (single source of truth)

categoryRoutes.get('/', async (c) => {
  const result = await categoryService.list()
  return ok(c, result)
})

categoryRoutes.post('/', adminOnly, zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json')
  const row = await categoryService.create(body)
  return created(c, row)
})

categoryRoutes.patch('/:id', adminOnly, zValidator('json', updateSchema), async (c) => {
  const id = c.req.param('id')!
  const body = c.req.valid('json')
  const row = await categoryService.update(id, body)
  return ok(c, row)
})

categoryRoutes.delete('/:id', adminOnly, async (c) => {
  const id = c.req.param('id')!
  const result = await categoryService.remove(id)
  return ok(c, result)
})
