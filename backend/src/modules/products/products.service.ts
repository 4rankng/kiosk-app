/**
 * Product service — business logic extracted from routes.
 */
import { eq, and, or, ilike, sql, isNull, inArray } from 'drizzle-orm'
import { db } from '../../config/db.js'
import {
  products,
  categories,
  units,
  priceListItems,
} from '../../db/schema/index.js'
import { AppError, NotFound, Conflict } from '../../lib/errors.js'
import { getGeneralPriceListId, resolveEffectivePrices } from '../../lib/price-lists.js'

// ---------------------------------------------------------------------------
//  Service
// ---------------------------------------------------------------------------

export const productService = {
  /** List products with pagination, search, and optional effective prices. */
  async list(params: {
    page: number
    pageSize: number
    offset: number
    q?: string
    categoryId?: string
    priceListId?: string | null
  }) {
    const { page, pageSize, offset, q, categoryId, priceListId = null } = params

    const conditions = []
    if (q) conditions.push(or(ilike(products.name, `%${q}%`), ilike(products.code, `%${q}%`)))
    if (categoryId) conditions.push(eq(products.categoryId, categoryId))
    const where = conditions.length ? and(...conditions) : undefined

    const [rows, [{ total = 0 } = { total: 0 }]] = await Promise.all([
      db
        .select({
          id: products.id,
          code: products.code,
          name: products.name,
          description: products.description,
          categoryId: products.categoryId,
          categoryName: categories.name,
          unitId: products.unitId,
          unitName: units.name,
          purchasePrice: products.purchasePrice,
          defaultSalePrice: products.defaultSalePrice,
          stockQuantity: products.stockQuantity,
          isActive: products.isActive,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(units, eq(products.unitId, units.id))
        .where(where)
        .orderBy(products.name)
        .limit(pageSize)
        .offset(offset),
      db.select({ total: sql<number>`count(*)::int` }).from(products).where(where),
    ])

    // Resolve effective prices
    const ids = rows.map((r) => r.id)
    const eff = await resolveEffectivePrices(ids, priceListId)
    const withEffective = rows.map((r) => ({
      ...r,
      effectivePrice: eff.get(r.id) ?? Number(r.defaultSalePrice),
    }))

    return { items: withEffective, total: Number(total) }
  },

  /** Get a single product by ID with optional effective price. */
  async getById(id: string, priceListId?: string | null) {
    const [row] = await db
      .select({
        id: products.id,
        code: products.code,
        name: products.name,
        description: products.description,
        categoryId: products.categoryId,
        categoryName: categories.name,
        unitId: products.unitId,
        unitName: units.name,
        purchasePrice: products.purchasePrice,
        defaultSalePrice: products.defaultSalePrice,
        stockQuantity: products.stockQuantity,
        isActive: products.isActive,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(units, eq(products.unitId, units.id))
      .where(eq(products.id, id))
      .limit(1)
    if (!row) throw NotFound('Sản phẩm không tồn tại')
    const eff = await resolveEffectivePrices([id], priceListId ?? null)
    return { ...row, effectivePrice: eff.get(id) ?? Number(row.defaultSalePrice) }
  },

  /** Create a product and auto-add to general price list. */
  async create(body: {
    code: string
    name: string
    description: string
    categoryId?: string | null
    unitId?: string | null
    purchasePrice: number
    defaultSalePrice: number
    stockQuantity: number
  }) {
    const [dup] = await db.select({ id: products.id }).from(products).where(eq(products.code, body.code)).limit(1)
    if (dup) throw Conflict('Mã sản phẩm đã tồn tại')
    const [row] = await db
      .insert(products)
      .values({
        ...body,
        purchasePrice: String(body.purchasePrice),
        defaultSalePrice: String(body.defaultSalePrice),
        isActive: true,
      })
      .returning()
    if (!row) throw new AppError(500, 'Failed to create product')

    // Auto-add to general price list
    const generalId = await getGeneralPriceListId()
    if (generalId) {
      await db
        .insert(priceListItems)
        .values({
          priceListId: generalId,
          productId: row.id,
          customPrice: String(body.defaultSalePrice),
        })
        .onConflictDoUpdate({
          target: [priceListItems.priceListId, priceListItems.productId],
          set: { customPrice: String(body.defaultSalePrice) },
        })
    }
    return row
  },

  /** Update a product and sync general price list if sale price changed. */
  async update(id: string, body: {
    code?: string
    name?: string
    description?: string
    categoryId?: string | null
    unitId?: string | null
    purchasePrice?: number
    defaultSalePrice?: number
    stockQuantity?: number
  }) {
    const [existing] = await db.select().from(products).where(eq(products.id, id)).limit(1)
    if (!existing) throw NotFound('Sản phẩm không tồn tại')
    if (body.code && body.code !== existing.code) {
      const [dup] = await db.select({ id: products.id }).from(products).where(eq(products.code, body.code)).limit(1)
      if (dup) throw Conflict('Mã sản phẩm đã tồn tại')
    }
    const now = new Date()
    const [row] = await db
      .update(products)
      .set({
        ...body,
        purchasePrice: body.purchasePrice !== undefined ? String(body.purchasePrice) : undefined,
        defaultSalePrice: body.defaultSalePrice !== undefined ? String(body.defaultSalePrice) : undefined,
        updatedAt: now,
      })
      .where(eq(products.id, id))
      .returning()
    if (!row) throw new AppError(500, 'Failed to update product')

    // If defaultSalePrice changed, sync the general price list entry
    if (body.defaultSalePrice !== undefined) {
      const generalId = await getGeneralPriceListId()
      if (generalId) {
        await db
          .insert(priceListItems)
          .values({
            priceListId: generalId,
            productId: id,
            customPrice: String(body.defaultSalePrice),
          })
          .onConflictDoUpdate({
            target: [priceListItems.priceListId, priceListItems.productId],
            set: { customPrice: String(body.defaultSalePrice), updatedAt: now },
          })
      }
    }
    return row
  },

  /** Delete a product. Throws Conflict if referenced by transactions. */
  async remove(id: string) {
    try {
      const deleted = await db.delete(products).where(eq(products.id, id)).returning()
      if (deleted.length === 0) throw NotFound('Sản phẩm không tồn tại')
      return { deleted: true }
    } catch (e: any) {
      if (e?.code === '23503') throw Conflict('Không thể xóa: sản phẩm đã phát sinh giao dịch')
      throw e
    }
  },
}
