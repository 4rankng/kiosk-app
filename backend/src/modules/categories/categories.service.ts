/**
 * Category service — business logic extracted from routes.
 */
import { eq, sql } from 'drizzle-orm'
import { db } from '../../config/db.js'
import { categories, products } from '../../db/schema/index.js'
import { Conflict, NotFound } from '../../lib/errors.js'
import { isPgError } from '../../lib/pg-error.js'

export const categoryService = {
  /** List all categories and build a nested tree. */
  async list() {
    const rows = await db.select().from(categories).orderBy(categories.name)
    // Build nested tree
    const byId = new Map(rows.map((r) => [r.id, { ...r, children: [] as typeof rows }]))
    const roots = [] as Array<typeof rows[number] & { children: unknown[] }>
    for (const r of rows) {
      if (r.parentId && byId.has(r.parentId)) {
        byId.get(r.parentId)!.children.push(r)
      } else {
        roots.push({ ...r, children: [] })
      }
    }
    return { items: rows, tree: roots }
  },

  /** Create a category. Validates parent exists if parentId is provided. */
  async create(body: { name: string; parentId?: string | null }) {
    if (body.parentId) {
      const [parent] = await db.select().from(categories).where(eq(categories.id, body.parentId)).limit(1)
      if (!parent) throw NotFound('Danh mục cha không tồn tại')
    }
    const [row] = await db
      .insert(categories)
      .values({ name: body.name, parentId: body.parentId ?? null, createdAt: new Date() })
      .returning()
    return row
  },

  /** Update a category (rename / re-parent). Prevents cycle. */
  async update(id: string, body: { name?: string; parentId?: string | null }) {
    const [existing] = await db.select().from(categories).where(eq(categories.id, id)).limit(1)
    if (!existing) throw NotFound('Danh mục không tồn tại')
    // prevent re-parenting to a descendant (would create a cycle)
    if (body.parentId === id) throw Conflict('Không thể đặt danh mục làm cha của chính nó')
    const [row] = await db
      .update(categories)
      .set({ name: body.name ?? existing.name, parentId: body.parentId === undefined ? existing.parentId : body.parentId })
      .where(eq(categories.id, id))
      .returning()
    return row
  },

  /** Delete a category. Refuses if it has products or children (count-then-delete in TX). */
  async remove(id: string) {
    try {
      return await db.transaction(async (tx) => {
        const [existing] = await tx.select().from(categories).where(eq(categories.id, id)).limit(1)
        if (!existing) throw NotFound('Danh mục không tồn tại')
        const [{ prodCount = 0 } = { prodCount: 0 }] = await tx
          .select({ prodCount: sql<number>`count(*)::int` })
          .from(products)
          .where(eq(products.categoryId, id))
        const [{ childCount = 0 } = { childCount: 0 }] = await tx
          .select({ childCount: sql<number>`count(*)::int` })
          .from(categories)
          .where(eq(categories.parentId, id))
        if (prodCount > 0) throw Conflict('Không thể xóa: danh mục đang chứa sản phẩm')
        if (childCount > 0) throw Conflict('Không thể xóa: danh mục đang chứa danh mục con')
        await tx.delete(categories).where(eq(categories.id, id))
        return { deleted: true }
      })
    } catch (e: unknown) {
      if (isPgError(e) && e.code === '23503') throw Conflict('Không thể xóa: danh mục đang được tham chiếu')
      throw e
    }
  },
}
