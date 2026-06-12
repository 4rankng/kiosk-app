/**
 * Customer service — business logic extracted from routes.
 */
import { eq, sql, ilike, and } from 'drizzle-orm'
import { db } from '../../config/db.js'
import { customers, companies, orders } from '../../db/schema/index.js'
import { AppError, Conflict, NotFound } from '../../lib/errors.js'
import { assertExists, assertUniqueCode } from '../../lib/db-helpers.js'

export const customerService = {
  /** List customers with pagination, search, and company filter. */
  async list(params: { page: number; pageSize: number; offset: number; q?: string; companyId?: string }) {
    const { page, pageSize, offset, q, companyId } = params

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
    return { items: rows, total: Number(total) }
  },

  /** Get a single customer by ID (includes company's priceListId). */
  async getById(id: string) {
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
    return row
  },

  /** Create a customer. Validates company exists and code is unique. */
  async create(body: {
    code: string
    name: string
    companyId: string
    phone?: string
    email?: string
    taxId?: string
    address?: string
    notes?: string
  }) {
    // Validate company
    await assertExists(companies, body.companyId, 'Công ty không tồn tại')
    // Validate unique code
    await assertUniqueCode(customers, body.code, 'Mã khách hàng đã tồn tại')

    const [row] = await db
      .insert(customers)
      .values({ ...body, isActive: true })
      .returning()
    if (!row) throw new AppError(500, 'Failed to create customer')
    return row
  },

  /** Update a customer. Validates unique code if changed. */
  async update(id: string, body: {
    code?: string
    name?: string
    phone?: string
    email?: string
    taxId?: string
    address?: string
    notes?: string
  }) {
    const [existing] = await db.select().from(customers).where(eq(customers.id, id)).limit(1)
    if (!existing) throw NotFound('Khách hàng không tồn tại')
    if (body.code && body.code !== existing.code) {
      await assertUniqueCode(customers, body.code, 'Mã khách hàng đã tồn tại', id)
    }
    const [row] = await db
      .update(customers)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning()
    if (!row) throw new AppError(500, 'Failed to update customer')
    return row
  },

  /** Delete a customer. Fails if it has orders. */
  async remove(id: string) {
    const [orderCount] = await db.select({ c: sql<number>`count(*)::int` }).from(orders).where(eq(orders.customerId, id))
    if ((orderCount?.c ?? 0) > 0) throw Conflict('Không thể xóa: khách hàng đã phát sinh đơn hàng')
    const deleted = await db.delete(customers).where(eq(customers.id, id)).returning()
    if (deleted.length === 0) throw NotFound('Khách hàng không tồn tại')
    return { deleted: true }
  },
}
