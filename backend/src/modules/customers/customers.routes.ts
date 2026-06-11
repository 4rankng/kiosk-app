/**
 * Customers (branches). Belong to a company; inherit the company's price list.
 * GET    /api/customers
 * GET    /api/customers/:id        — includes priceListId for client-side price resolution
 * POST   /api/customers
 * PATCH  /api/customers/:id
 * DELETE /api/customers/:id
 */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { eq, sql, ilike, and, isNotNull } from 'drizzle-orm'
import { db } from '../../config/db.js'
import { customers, companies, orders, invoices } from '../../db/schema/index.js'
import { requireAuth } from '../../middleware/auth.js'
import { ok, created, paginated } from '../../lib/response.js'
import { Conflict, NotFound } from '../../lib/errors.js'
import { parsePagination } from '../../lib/pagination.js'

export const customerRoutes = new Hono()
customerRoutes.use('*', requireAuth)

const baseSchema = z.object({
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(160),
  companyId: z.string().uuid(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  taxId: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

const createSchema = baseSchema
const updateSchema = baseSchema.partial().omit({ companyId: true })

customerRoutes.get('/', async (c) => {
  const { page, pageSize, offset, q } = parsePagination(c)
  const companyId = c.req.query('companyId')

  const conditions = []
  if (q) conditions.push(ilike(customers.name, `%${q}%`))
  if (companyId) conditions.push(eq(customers.companyId, companyId))
  const where = conditions.length ? and(...conditions) : undefined

  const [rows, [{ total = 0 } = { total: 0 }]] = await Promise.all([
    db
      .select({
        id: customers.id,
        code: customers.code,
        name: customers.name,
        companyId: customers.companyId,
        companyName: companies.name,
        priceListId: companies.priceListId,
        phone: customers.phone,
        email: customers.email,
        taxId: customers.taxId,
        address: customers.address,
        isActive: customers.isActive,
      })
      .from(customers)
      .leftJoin(companies, eq(customers.companyId, companies.id))
      .where(where)
      .orderBy(customers.name)
      .limit(pageSize)
      .offset(offset),
    db.select({ total: sql<number>`count(*)::int` }).from(customers).where(where),
  ])
  return paginated(c, rows, Number(total), page, pageSize)
})

customerRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')!
  const [row] = await db
    .select({
      id: customers.id,
      code: customers.code,
      name: customers.name,
      companyId: customers.companyId,
      companyName: companies.name,
      priceListId: companies.priceListId,
      phone: customers.phone,
      email: customers.email,
      taxId: customers.taxId,
      address: customers.address,
      isActive: customers.isActive,
    })
    .from(customers)
    .leftJoin(companies, eq(customers.companyId, companies.id))
    .where(eq(customers.id, id))
    .limit(1)
  if (!row) throw NotFound('Khách hàng không tồn tại')
  return ok(c, row)
})

customerRoutes.post('/', zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json')
  // Validate company
  const [company] = await db
    .select({ id: companies.id })
    .from(companies)
    .where(eq(companies.id, body.companyId))
    .limit(1)
  if (!company) throw NotFound('Công ty không tồn tại')
  // Validate unique code
  const [existing] = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.code, body.code))
    .limit(1)
  if (existing) throw Conflict('Mã khách hàng đã tồn tại')

  const now = new Date().toISOString()
  const [row] = await db
    .insert(customers)
    .values({ ...body, isActive: 'true', createdAt: now, updatedAt: now })
    .returning()
  return created(c, row)
})

customerRoutes.patch('/:id', zValidator('json', updateSchema), async (c) => {
  const id = c.req.param('id')!
  const body = c.req.valid('json')
  const [existing] = await db.select().from(customers).where(eq(customers.id, id)).limit(1)
  if (!existing) throw NotFound('Khách hàng không tồn tại')
  if (body.code && body.code !== existing.code) {
    const [dup] = await db.select({ id: customers.id }).from(customers).where(eq(customers.code, body.code)).limit(1)
    if (dup) throw Conflict('Mã khách hàng đã tồn tại')
  }
  const [row] = await db
    .update(customers)
    .set({ ...body, updatedAt: new Date().toISOString() })
    .where(eq(customers.id, id))
    .returning()
  return ok(c, row)
})

customerRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id')!
  const [orderCount] = await db.select({ c: sql<number>`count(*)::int` }).from(orders).where(eq(orders.customerId, id))
  if ((orderCount?.c ?? 0) > 0) throw Conflict('Không thể xóa: khách hàng đã phát sinh đơn hàng')
  const deleted = await db.delete(customers).where(eq(customers.id, id)).returning()
  if (deleted.length === 0) throw NotFound('Khách hàng không tồn tại')
  return ok(c, { deleted: true })
})
