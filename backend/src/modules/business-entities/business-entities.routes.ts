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
import { eq, sql } from 'drizzle-orm'
import { db } from '../../config/db.js'
import { businessEntities, orders, invoices } from '../../db/schema/index.js'
import { requireAuth } from '../../middleware/auth.js'
import { ok, created } from '../../lib/response.js'
import { Conflict, NotFound } from '../../lib/errors.js'

export const businessEntityRoutes = new Hono()
businessEntityRoutes.use('*', requireAuth)

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
  const rows = await db.select().from(businessEntities).orderBy(businessEntities.name)
  return ok(c, rows)
})

businessEntityRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')!
  const [row] = await db.select().from(businessEntities).where(eq(businessEntities.id, id)).limit(1)
  if (!row) throw NotFound('Hộ kinh doanh không tồn tại')
  return ok(c, row)
})

businessEntityRoutes.post('/', zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json')
  const now = new Date().toISOString()
  const [row] = await db
    .insert(businessEntities)
    .values({ ...body, createdAt: now, updatedAt: now })
    .returning()
  return created(c, row)
})

businessEntityRoutes.patch('/:id', zValidator('json', updateSchema), async (c) => {
  const id = c.req.param('id')!
  const body = c.req.valid('json')
  const [existing] = await db.select().from(businessEntities).where(eq(businessEntities.id, id)).limit(1)
  if (!existing) throw NotFound('Hộ kinh doanh không tồn tại')
  const [row] = await db
    .update(businessEntities)
    .set({ ...body, updatedAt: new Date().toISOString() })
    .where(eq(businessEntities.id, id))
    .returning()
  return ok(c, row)
})

businessEntityRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id')!
  const [orderCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(orders)
    .where(eq(orders.businessEntityId, id))
  const [invoiceCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(invoices)
    .where(eq(invoices.businessEntityId, id))
  if (((orderCount?.c ?? 0) + (invoiceCount?.c ?? 0)) > 0) {
    throw Conflict('Không thể xóa: hộ kinh doanh đã phát sinh đơn hàng / hóa đơn')
  }
  const deleted = await db.delete(businessEntities).where(eq(businessEntities.id, id)).returning()
  if (deleted.length === 0) throw NotFound('Hộ kinh doanh không tồn tại')
  return ok(c, { deleted: true })
})
