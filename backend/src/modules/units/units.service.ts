/**
 * Unit service — business logic extracted from routes.
 */
import { eq, sql } from 'drizzle-orm'
import { db } from '../../config/db.js'
import { units, products } from '../../db/schema/index.js'
import { Conflict, NotFound } from '../../lib/errors.js'

export const unitService = {
  /** List all units. */
  async list() {
    return await db.select().from(units).orderBy(units.name)
  },

  /** Create a unit. Catches unique-violation (23505). */
  async create(body: { name: string; abbreviation?: string }) {
    try {
      const [row] = await db
        .insert(units)
        .values({ name: body.name, abbreviation: body.abbreviation, createdAt: new Date() })
        .returning()
      return row
    } catch (e: any) {
      if (e?.code === '23505') throw Conflict('Đơn vị tính đã tồn tại')
      throw e
    }
  },

  /** Delete a unit. Refuses if any product uses it (count-then-delete in TX). */
  async remove(id: string) {
    try {
      return await db.transaction(async (tx) => {
        const [count] = await tx
          .select({ c: sql<number>`count(*)::int` })
          .from(products)
          .where(eq(products.unitId, id))
        if ((count?.c ?? 0) > 0) throw Conflict('Không thể xóa: đơn vị đang được sử dụng bởi sản phẩm')
        const deleted = await tx.delete(units).where(eq(units.id, id)).returning()
        if (deleted.length === 0) throw NotFound('Đơn vị tính không tồn tại')
        return { deleted: true }
      })
    } catch (e: any) {
      if (e?.code === '23503') throw Conflict('Không thể xóa: đơn vị đang được tham chiếu')
      throw e
    }
  },
}
