/**
 * Price lists — list, get with items, create, bulk-upsert items, delete.
 * GET    /api/price-lists
 * GET    /api/price-lists/:id/items
 * POST   /api/price-lists
 * PUT    /api/price-lists/:id/items      — body: { items: [{ productId, customPrice }] }
 * DELETE /api/price-lists/:id
 */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../../middleware/auth.js'
import { adminOnly, anyRole } from '../../middleware/rbac.js'
import { ok, created } from '../../lib/response.js'
import { priceListService } from './price-lists.service.js'

export const priceListRoutes = new Hono()
priceListRoutes.use('*', requireAuth, anyRole)

const createSchema = z.object({
  name: z.string().min(1).max(160),
  companyId: z.string().uuid().nullable().optional(),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
})

const bulkUpsertSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        customPrice: z.coerce.number().min(0),
      })
    )
    .max(5000),
})

// ---------------------------------------------------------------------------
priceListRoutes.get('/', async (c) => {
  const companyId = c.req.query('companyId') || null
  const rows = await priceListService.list(companyId)
  return ok(c, rows)
})

priceListRoutes.get('/:id/items', async (c) => {
  const id = c.req.param('id')!
  const result = await priceListService.getItems(id)
  return ok(c, result)
})

priceListRoutes.post('/', adminOnly, zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json')
  const row = await priceListService.create(body)
  return created(c, row)
})

priceListRoutes.put('/:id/items', adminOnly, zValidator('json', bulkUpsertSchema), async (c) => {
  const id = c.req.param('id')!
  const { items } = c.req.valid('json')
  const result = await priceListService.upsertItems(id, items)
  return ok(c, result)
})

priceListRoutes.delete('/:id', adminOnly, async (c) => {
  const id = c.req.param('id')!
  const result = await priceListService.remove(id)
  return ok(c, result)
})
