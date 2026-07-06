/**
 * Price list service — business logic extracted from routes.
 */
import { eq, and, sql, isNull } from 'drizzle-orm'
import { db } from '../../config/db.js'
import {
  priceLists,
  priceListItems,
  products,
  companies,
  units,
} from '../../db/schema/index.js'
import { AppError, BadRequest, NotFound, Conflict } from '../../lib/errors.js'
import { invalidateGeneralPriceListCache } from '../../lib/price-lists.js'

// ---------------------------------------------------------------------------
//  Service
// ---------------------------------------------------------------------------

export const priceListService = {
  /** List price lists with optional companyId filter. */
  async list(companyId?: string | null) {
    const where =
      companyId === 'null' || companyId === ''
        ? isNull(priceLists.companyId)
        : companyId
          ? eq(priceLists.companyId, companyId)
          : undefined
    const rows = await db
      .select({
        id: priceLists.id,
        name: priceLists.name,
        companyId: priceLists.companyId,
        companyName: companies.name,
        isDefault: priceLists.isDefault,
        description: priceLists.description,
        itemCount:
          sql<number>`(SELECT count(*)::int FROM ${priceListItems} WHERE ${priceListItems.priceListId} = ${priceLists.id})`,
      })
      .from(priceLists)
      .leftJoin(companies, eq(priceLists.companyId, companies.id))
      .where(where)
      .orderBy(priceLists.sortOrder, priceLists.name)
    return rows
  },

  /** Get a price list with all product items. */
  async getItems(id: string) {
    const [pl] = await db
      .select({
        id: priceLists.id,
        name: priceLists.name,
        companyId: priceLists.companyId,
        isDefault: priceLists.isDefault,
        description: priceLists.description,
        sortOrder: priceLists.sortOrder,
      })
      .from(priceLists)
      .where(eq(priceLists.id, id))
      .limit(1)
    if (!pl) throw NotFound('Bảng giá không tồn tại')

    const rows = await db
      .select({
        productId: products.id,
        code: products.code,
        name: products.name,
        unitName: units.name,
        stockQuantity: products.stockQuantity,
        defaultSalePrice: products.defaultSalePrice,
        customPrice: priceListItems.customPrice,
        hasOverride: sql<boolean>`${priceListItems.id} IS NOT NULL`,
      })
      .from(products)
      .leftJoin(
        units,
        eq(products.unitId, units.id)
      )
      .leftJoin(
        priceListItems,
        and(
          eq(priceListItems.priceListId, id),
          eq(priceListItems.productId, products.id)
        )
      )
      .where(eq(products.isActive, true))
      .orderBy(products.name)

    return {
      priceList: pl,
      items: rows.map((r) => ({
        productId: r.productId,
        code: r.code,
        name: r.name,
        unit: r.unitName ?? '',
        stockQuantity: r.stockQuantity,
        basePrice: Number(r.defaultSalePrice),
        customPrice:
          r.customPrice !== null
            ? Number(r.customPrice)
            : Number(r.defaultSalePrice),
        hasOverride: r.hasOverride,
      })),
    }
  },

  /** Create a price list with validation. Un-default + insert run in one TX. */
  async create(body: {
    name: string
    companyId?: string | null
    description?: string
    isDefault: boolean
  }) {
    if (body.companyId) {
      const [co] = await db
        .select({ id: companies.id })
        .from(companies)
        .where(eq(companies.id, body.companyId))
        .limit(1)
      if (!co) throw NotFound('Công ty không tồn tại')
    }
    if (body.isDefault && body.companyId)
      throw BadRequest('Bảng giá chung không thể gắn với công ty')

    const row = await db.transaction(async (tx) => {
      if (body.isDefault) {
        // Unset any existing default
        await tx
          .update(priceLists)
          .set({ isDefault: false })
          .where(eq(priceLists.isDefault, true))
      }
      const [inserted] = await tx
        .insert(priceLists)
        .values({
          name: body.name,
          companyId: body.companyId ?? null,
          description: body.description,
          isDefault: body.isDefault,
          sortOrder: 0,
        })
        .returning()
      if (!inserted) throw new AppError(500, 'Failed to create price list')
      return inserted
    })
    await invalidateGeneralPriceListCache()
    return row
  },

  /** Bulk upsert items in chunks of 500. The whole loop runs in one TX. */
  async upsertItems(
    id: string,
    items: Array<{ productId: string; customPrice: number }>
  ) {
    const [pl] = await db
      .select({ id: priceLists.id })
      .from(priceLists)
      .where(eq(priceLists.id, id))
      .limit(1)
    if (!pl) throw NotFound('Bảng giá không tồn tại')
    if (items.length === 0) return { upserted: 0 }

    await db.transaction(async (tx) => {
      const now = new Date()
      // Upsert in chunks to avoid huge VALUES
      const CHUNK = 500
      for (let i = 0; i < items.length; i += CHUNK) {
        const chunk = items.slice(i, i + CHUNK)
        await tx
          .insert(priceListItems)
          .values(
            chunk.map((it) => ({
              priceListId: id,
              productId: it.productId,
              customPrice: String(it.customPrice),
            }))
          )
          .onConflictDoUpdate({
            target: [priceListItems.priceListId, priceListItems.productId],
            set: { customPrice: sql`EXCLUDED.custom_price`, updatedAt: now },
          })
      }
    })
    await invalidateGeneralPriceListCache()
    return { upserted: items.length }
  },

  /** Delete a price list. General PL is protected. */
  async remove(id: string) {
    const [pl] = await db
      .select({ id: priceLists.id, isDefault: priceLists.isDefault })
      .from(priceLists)
      .where(eq(priceLists.id, id))
      .limit(1)
    if (!pl) throw NotFound('Bảng giá không tồn tại')
    if (pl.isDefault === true)
      throw Conflict('Không thể xóa bảng giá chung')
    await db.delete(priceLists).where(eq(priceLists.id, id))
    await invalidateGeneralPriceListCache()
    return { deleted: true }
  },
}
