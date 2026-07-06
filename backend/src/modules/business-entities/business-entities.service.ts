/**
 * Business entity service — business logic extracted from routes.
 */
import { eq, sql } from 'drizzle-orm'
import { db } from '../../config/db.js'
import { businessEntities, orders, invoices } from '../../db/schema/index.js'
import { Conflict, NotFound } from '../../lib/errors.js'
import { isPgError } from '../../lib/pg-error.js'

export const businessEntityService = {
  /** List all business entities. */
  async list() {
    return await db.select().from(businessEntities).orderBy(businessEntities.name)
  },

  /** Get a single business entity by ID. */
  async getById(id: string) {
    const [row] = await db.select().from(businessEntities).where(eq(businessEntities.id, id)).limit(1)
    if (!row) throw NotFound('Hộ kinh doanh không tồn tại')
    return row
  },

  /** Create a business entity. */
  async create(body: {
    name: string
    taxCode?: string
    address?: string
    phone?: string
    email?: string
    headerLines?: string[]
  }) {
    const now = new Date()
    const [row] = await db
      .insert(businessEntities)
      .values({ ...body, createdAt: now, updatedAt: now })
      .returning()
    return row
  },

  /** Update a business entity. */
  async update(id: string, body: {
    name?: string
    taxCode?: string
    address?: string
    phone?: string
    email?: string
    headerLines?: string[]
  }) {
    const [existing] = await db.select().from(businessEntities).where(eq(businessEntities.id, id)).limit(1)
    if (!existing) throw NotFound('Hộ kinh doanh không tồn tại')
    const [row] = await db
      .update(businessEntities)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(businessEntities.id, id))
      .returning()
    return row
  },

  /** Delete a business entity. Refuses if it has orders/invoices (count-then-delete in TX). */
  async remove(id: string) {
    try {
      return await db.transaction(async (tx) => {
        const [orderCount] = await tx
          .select({ c: sql<number>`count(*)::int` })
          .from(orders)
          .where(eq(orders.businessEntityId, id))
        const [invoiceCount] = await tx
          .select({ c: sql<number>`count(*)::int` })
          .from(invoices)
          .where(eq(invoices.businessEntityId, id))
        if (((orderCount?.c ?? 0) + (invoiceCount?.c ?? 0)) > 0) {
          throw Conflict('Không thể xóa: hộ kinh doanh đã phát sinh đơn hàng / hóa đơn')
        }
        const deleted = await tx.delete(businessEntities).where(eq(businessEntities.id, id)).returning()
        if (deleted.length === 0) throw NotFound('Hộ kinh doanh không tồn tại')
        return { deleted: true }
      })
    } catch (e: unknown) {
      if (isPgError(e) && e.code === '23503') throw Conflict('Không thể xóa: hộ kinh doanh đang được tham chiếu')
      throw e
    }
  },
}
