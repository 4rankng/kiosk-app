/**
 * Price lists — list, get with items, create, bulk-upsert items, delete.
 * GET    /api/price-lists
 * GET    /api/price-lists/:id/items
 * POST   /api/price-lists
 * PUT    /api/price-lists/:id/items      — body: { items: [{ productId, customPrice }] }
 * DELETE /api/price-lists/:id
 */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { eq, and, sql, isNull, inArray } from 'drizzle-orm'
import { db } from '../../config/db.js'
import {
  priceLists,
  priceListItems,
  products,
  companies,
} from '../../db/schema/index.js'
import { requireAuth } from '../../middleware/auth.js'
import { ok, created } from '../../lib/response.js'
import { BadRequest, NotFound, Conflict } from '../../lib/errors.js'

export const priceListRoutes = new Hono()
priceListRoutes.use('*', requireAuth)

const createSchema = z.object({
  name: z.string().min(1).max(160),
  companyId: z.string().uuid().nullable().optional(),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
})

const bulkUpsertSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        customPrice: z.coerce.number().min(0),
      })
    )
    .max(5000),
})

priceListRoutes.get('/', async (c) => {
  const companyId = c.req.query('companyId')
  const where = companyId === 'null' || companyId === '' ? isNull(priceLists.companyId) : companyId ? eq(priceLists.companyId, companyId) : undefined
  const rows = await db
    .select({
      id: priceLists.id,
      name: priceLists.name,
      companyId: priceLists.companyId,
      companyName: companies.name,
      isDefault: priceLists.isDefault,
      description: priceLists.description,
      itemCount: sql<number>`(SELECT count(*)::int FROM ${priceListItems} WHERE ${priceListItems.priceListId} = ${priceLists.id})`,
    })
    .from(priceLists)
    .leftJoin(companies, eq(priceLists.companyId, companies.id))
    .where(where)
    .orderBy(priceLists.sortOrder, priceLists.name)
  return ok(c, rows)
})

priceListRoutes.get('/:id/items', async (c) => {
  const id = c.req.param('id')!
  const [pl] = await db.select().from(priceLists).where(eq(priceLists.id, id)).limit(1)
  if (!pl) throw NotFound('Bảng giá không tồn tại')

  const rows = await db
    .select({
      productId: products.id,
      code: products.code,
      name: products.name,
      unitName: sql<string>`(SELECT name FROM units WHERE id = ${products.unitId})`,
      stockQuantity: products.stockQuantity,
      defaultSalePrice: products.defaultSalePrice,
      customPrice: priceListItems.customPrice,
      hasOverride: sql<boolean>`${priceListItems.id} IS NOT NULL`,
    })
    .from(products)
    .leftJoin(priceListItems, and(eq(priceListItems.priceListId, id), eq(priceListItems.productId, products.id)))
    .where(eq(products.isActive, 'true'))
    .orderBy(products.name)

  return ok(c, {
    priceList: pl,
    items: rows.map((r) => ({
      productId: r.productId,
      code: r.code,
      name: r.name,
      unit: r.unitName ?? '',
      stockQuantity: r.stockQuantity,
      basePrice: Number(r.defaultSalePrice),
      customPrice: r.customPrice !== null ? Number(r.customPrice) : Number(r.defaultSalePrice),
      hasOverride: r.hasOverride,
    })),
  })
})

priceListRoutes.post('/', zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json')
  if (body.companyId) {
    const [co] = await db.select({ id: companies.id }).from(companies).where(eq(companies.id, body.companyId)).limit(1)
    if (!co) throw NotFound('Công ty không tồn tại')
  }
  if (body.isDefault && body.companyId) throw BadRequest('Bảng giá chung không thể gắn với công ty')
  if (body.isDefault) {
    // Unset any existing default
    await db.update(priceLists).set({ isDefault: 'false' }).where(eq(priceLists.isDefault, 'true'))
  }
  const now = new Date().toISOString()
  const [row] = await db
    .insert(priceLists)
    .values({
      name: body.name,
      companyId: body.companyId ?? null,
      description: body.description,
      isDefault: body.isDefault ? 'true' : 'false',
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
  return created(c, row)
})

priceListRoutes.put('/:id/items', zValidator('json', bulkUpsertSchema), async (c) => {
  const id = c.req.param('id')!
  const [pl] = await db.select().from(priceLists).where(eq(priceLists.id, id)).limit(1)
  if (!pl) throw NotFound('Bảng giá không tồn tại')
  const { items } = c.req.valid('json')
  if (items.length === 0) return ok(c, { upserted: 0 })

  const now = new Date().toISOString()
  // Upsert in chunks to avoid huge VALUES
  const CHUNK = 500
  for (let i = 0; i < items.length; i += CHUNK) {
    const chunk = items.slice(i, i + CHUNK)
    await db
      .insert(priceListItems)
      .values(
        chunk.map((it) => ({
          priceListId: id,
          productId: it.productId,
          customPrice: String(it.customPrice),
          createdAt: now,
          updatedAt: now,
        }))
      )
      .onConflictDoUpdate({
        target: [priceListItems.priceListId, priceListItems.productId],
        set: { customPrice: sql`EXCLUDED.custom_price`, updatedAt: now },
      })
  }
  return ok(c, { upserted: items.length })
})

priceListRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id')!
  const [pl] = await db.select().from(priceLists).where(eq(priceLists.id, id)).limit(1)
  if (!pl) throw NotFound('Bảng giá không tồn tại')
  if (pl.isDefault === 'true') throw Conflict('Không thể xóa bảng giá chung')
  await db.delete(priceLists).where(eq(priceLists.id, id))
  return ok(c, { deleted: true })
})
