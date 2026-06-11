/**
 * Products — CRUD with optional `priceListId` query param.
 * When ?priceListId= is provided, products get an `effectivePrice` field
 * resolved as: company PL > general PL > defaultSalePrice.
 *
 * Auto-creates a price-list-item in the GENERAL price list on POST
 * (matches the spec: "khi sản phẩm được lưu, tạo bản ghi Bảng giá chung mới").
 */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { eq, and, or, ilike, sql, isNull } from 'drizzle-orm'
import { db } from '../../config/db.js'
import {
  products,
  categories,
  units,
  priceLists,
  priceListItems,
} from '../../db/schema/index.js'
import { requireAuth } from '../../middleware/auth.js'
import { ok, created, paginated } from '../../lib/response.js'
import { NotFound, Conflict, BadRequest } from '../../lib/errors.js'
import { parsePagination } from '../../lib/pagination.js'

export const productRoutes = new Hono()
productRoutes.use('*', requireAuth)

const baseSchema = z.object({
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).default(''),
  categoryId: z.string().uuid().nullable().optional(),
  unitId: z.string().uuid().nullable().optional(),
  purchasePrice: z.coerce.number().min(0),
  defaultSalePrice: z.coerce.number().min(0),
  stockQuantity: z.coerce.number().int().default(0),
})

const createSchema = baseSchema
const updateSchema = baseSchema.partial()

// Helper: find the general price list (companyId IS NULL, is_default = 'true')
async function getGeneralPriceListId(): Promise<string | null> {
  const [row] = await db
    .select({ id: priceLists.id })
    .from(priceLists)
    .where(and(isNull(priceLists.companyId), eq(priceLists.isDefault, 'true')))
    .limit(1)
  if (row) return row.id
  // Fallback: any price list with companyId IS NULL
  const [any] = await db
    .select({ id: priceLists.id })
    .from(priceLists)
    .where(isNull(priceLists.companyId))
    .limit(1)
  return any?.id ?? null
}

// Helper: resolve effective price for a product
async function resolveEffectivePrices(
  productIds: string[],
  priceListId: string | null
): Promise<Map<string, number>> {
  const map = new Map<string, number>()
  if (productIds.length === 0) return map

  // 1) Pull general PL prices
  const generalId = await getGeneralPriceListId()
  if (generalId) {
    const generalItems = await db
      .select({ productId: priceListItems.productId, price: priceListItems.customPrice })
      .from(priceListItems)
      .where(and(eq(priceListItems.priceListId, generalId), sql`${priceListItems.productId} = ANY(${productIds})`))
    for (const i of generalItems) map.set(i.productId, Number(i.price))
  }

  // 2) Override with company-specific PL
  if (priceListId && priceListId !== generalId) {
    const customItems = await db
      .select({ productId: priceListItems.productId, price: priceListItems.customPrice })
      .from(priceListItems)
      .where(
        and(eq(priceListItems.priceListId, priceListId), sql`${priceListItems.productId} = ANY(${productIds})`)
      )
    for (const i of customItems) map.set(i.productId, Number(i.price))
  }

  return map
}

// ---------------------------------------------------------------------------
productRoutes.get('/', async (c) => {
  const { page, pageSize, offset, q } = parsePagination(c)
  const categoryId = c.req.query('categoryId')
  const priceListId = c.req.query('priceListId') || null

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

  return paginated(c, withEffective, Number(total), page, pageSize)
})

productRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')!
  const priceListId = c.req.query('priceListId') || null
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
  const eff = await resolveEffectivePrices([id], priceListId)
  return ok(c, { ...row, effectivePrice: eff.get(id) ?? Number(row.defaultSalePrice) })
})

productRoutes.post('/', zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json')
  const [dup] = await db.select({ id: products.id }).from(products).where(eq(products.code, body.code)).limit(1)
  if (dup) throw Conflict('Mã sản phẩm đã tồn tại')
  const now = new Date().toISOString()
  const [row] = await db
    .insert(products)
    .values({
      ...body,
      purchasePrice: String(body.purchasePrice),
      defaultSalePrice: String(body.defaultSalePrice),
      isActive: 'true',
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  // Auto-add to general price list
  const generalId = await getGeneralPriceListId()
  if (generalId) {
    await db
      .insert(priceListItems)
      .values({
        priceListId: generalId,
        productId: row!.id,
        customPrice: String(body.defaultSalePrice),
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [priceListItems.priceListId, priceListItems.productId],
        set: { customPrice: String(body.defaultSalePrice), updatedAt: now },
      })
  }
  return created(c, row)
})

productRoutes.patch('/:id', zValidator('json', updateSchema), async (c) => {
  const id = c.req.param('id')!
  const body = c.req.valid('json')
  const [existing] = await db.select().from(products).where(eq(products.id, id)).limit(1)
  if (!existing) throw NotFound('Sản phẩm không tồn tại')
  if (body.code && body.code !== existing.code) {
    const [dup] = await db.select({ id: products.id }).from(products).where(eq(products.code, body.code)).limit(1)
    if (dup) throw Conflict('Mã sản phẩm đã tồn tại')
  }
  const now = new Date().toISOString()
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
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [priceListItems.priceListId, priceListItems.productId],
          set: { customPrice: String(body.defaultSalePrice), updatedAt: now },
        })
    }
  }
  return ok(c, row)
})

productRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id')!
  try {
    const deleted = await db.delete(products).where(eq(products.id, id)).returning()
    if (deleted.length === 0) throw NotFound('Sản phẩm không tồn tại')
    return ok(c, { deleted: true })
  } catch (e: any) {
    if (e?.code === '23503') throw Conflict('Không thể xóa: sản phẩm đã phát sinh giao dịch')
    throw e
  }
})
