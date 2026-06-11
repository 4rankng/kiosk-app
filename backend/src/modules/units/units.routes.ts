/**
 * Units — flat list, inline-create friendly.
 * GET    /api/units
 * POST   /api/units
 * DELETE /api/units/:id
 */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { eq, sql } from 'drizzle-orm'
import { db } from '../../config/db.js'
import { units, products } from '../../db/schema/index.js'
import { requireAuth } from '../../middleware/auth.js'
import { ok, created } from '../../lib/response.js'
import { Conflict, NotFound } from '../../lib/errors.js'

export const unitRoutes = new Hono()
unitRoutes.use('*', requireAuth)

const createSchema = z.object({
  name: z.string().min(1).max(40),
  abbreviation: z.string().max(10).optional(),
})

unitRoutes.get('/', async (c) => {
  const rows = await db.select().from(units).orderBy(units.name)
  return ok(c, rows)
})

unitRoutes.post('/', zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json')
  try {
    const [row] = await db
      .insert(units)
      .values({ name: body.name, abbreviation: body.abbreviation, createdAt: new Date().toISOString() })
      .returning()
    return created(c, row)
  } catch (e: any) {
    if (e?.code === '23505') throw Conflict('Đơn vị tính đã tồn tại')
    throw e
  }
})

unitRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id')!
  const [count] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(products)
    .where(eq(products.unitId, id))
  if ((count?.c ?? 0) > 0) throw Conflict('Không thể xóa: đơn vị đang được sử dụng bởi sản phẩm')
  const deleted = await db.delete(units).where(eq(units.id, id)).returning()
  if (deleted.length === 0) throw NotFound('Đơn vị tính không tồn tại')
  return ok(c, { deleted: true })
})
