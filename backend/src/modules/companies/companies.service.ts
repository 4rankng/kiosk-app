/**
 * Company service — business logic extracted from routes.
 */
import { eq, sql, ilike, and } from 'drizzle-orm'
import { db } from '../../config/db.js'
import { companies, customers, priceLists } from '../../db/schema/index.js'
import { AppError, Conflict, NotFound } from '../../lib/errors.js'
import { assertExists } from '../../lib/db-helpers.js'

export const companyService = {
  /** List companies with pagination and search. */
  async list(params: { page: number; pageSize: number; offset: number; q?: string }) {
    const { page, pageSize, offset, q } = params
    const where = q ? ilike(companies.name, `%${q}%`) : undefined
    const [rows, [{ total = 0 } = { total: 0 }]] = await Promise.all([
      db.select().from(companies).where(where).orderBy(companies.name).limit(pageSize).offset(offset),
      db.select({ total: sql<number>`count(*)::int` }).from(companies).where(where),
    ])
    return { items: rows, total: Number(total) }
  },

  /** Get a single company by ID. */
  async getById(id: string) {
    const [row] = await db.select().from(companies).where(eq(companies.id, id)).limit(1)
    if (!row) throw NotFound('Công ty không tồn tại')
    return row
  },

  /** Create a company. Validates priceListId if provided. */
  async create(body: {
    name: string
    taxCode?: string
    priceListId?: string | null
    address?: string
    phone?: string
    email?: string
    notes?: string
  }) {
    // If a priceListId is provided, validate it exists
    if (body.priceListId) {
      await assertExists(priceLists, body.priceListId, 'Bảng giá không tồn tại')
    }
    const [row] = await db
      .insert(companies)
      .values({ ...body, isActive: true })
      .returning()
    if (!row) throw new AppError(500, 'Failed to create company')
    return row
  },

  /** Update a company. */
  async update(id: string, body: {
    name?: string
    taxCode?: string
    priceListId?: string | null
    address?: string
    phone?: string
    email?: string
    notes?: string
  }) {
    const [existing] = await db.select().from(companies).where(eq(companies.id, id)).limit(1)
    if (!existing) throw NotFound('Công ty không tồn tại')
    const [row] = await db
      .update(companies)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning()
    if (!row) throw new AppError(500, 'Failed to update company')
    return row
  },

  /** Delete a company. Fails if it has customers. */
  async remove(id: string) {
    const [custCount] = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(customers)
      .where(eq(customers.companyId, id))
    if ((custCount?.c ?? 0) > 0) {
      throw Conflict('Không thể xóa: công ty đang có chi nhánh khách hàng')
    }
    const deleted = await db.delete(companies).where(eq(companies.id, id)).returning()
    if (deleted.length === 0) throw NotFound('Công ty không tồn tại')
    return { deleted: true }
  },
}
