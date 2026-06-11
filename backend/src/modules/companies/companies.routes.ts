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
import { eq, sql, ilike, and } from 'drizzle-orm'
import { db } from '../../config/db.js'
import { companies, customers, priceLists } from '../../db/schema/index.js'
import { requireAuth } from '../../middleware/auth.js'
import { ok, created, paginated } from '../../lib/response.js'
import { Conflict, NotFound } from '../../lib/errors.js'
import { parsePagination } from '../../lib/pagination.js'

export const companyRoutes = new Hono()
companyRoutes.use('*', requireAuth)

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
  const where = q ? ilike(companies.name, `%${q}%`) : undefined
  const [rows, [{ total = 0 } = { total: 0 }]] = await Promise.all([
    db.select().from(companies).where(where).orderBy(companies.name).limit(pageSize).offset(offset),
    db.select({ total: sql<number>`count(*)::int` }).from(companies).where(where),
  ])
  return paginated(c, rows, Number(total), page, pageSize)
})

companyRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')!
  const [row] = await db.select().from(companies).where(eq(companies.id, id)).limit(1)
  if (!row) throw NotFound('Công ty không tồn tại')
  return ok(c, row)
})

companyRoutes.post('/', zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json')
  const now = new Date().toISOString()
  // If a priceListId is provided, validate it exists
  if (body.priceListId) {
    const [pl] = await db.select({ id: priceLists.id }).from(priceLists).where(eq(priceLists.id, body.priceListId)).limit(1)
    if (!pl) throw NotFound('Bảng giá không tồn tại')
  }
  const [row] = await db
    .insert(companies)
    .values({ ...body, isActive: 'true', createdAt: now, updatedAt: now })
    .returning()
  return created(c, row)
})

companyRoutes.patch('/:id', zValidator('json', updateSchema), async (c) => {
  const id = c.req.param('id')!
  const body = c.req.valid('json')
  const [existing] = await db.select().from(companies).where(eq(companies.id, id)).limit(1)
  if (!existing) throw NotFound('Công ty không tồn tại')
  const [row] = await db
    .update(companies)
    .set({ ...body, updatedAt: new Date().toISOString() })
    .where(eq(companies.id, id))
    .returning()
  return ok(c, row)
})

companyRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id')!
  const [custCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(customers)
    .where(eq(customers.companyId, id))
  if ((custCount?.c ?? 0) > 0) {
    throw Conflict('Không thể xóa: công ty đang có chi nhánh khách hàng')
  }
  const deleted = await db.delete(companies).where(eq(companies.id, id)).returning()
  if (deleted.length === 0) throw NotFound('Công ty không tồn tại')
  return ok(c, { deleted: true })
})
