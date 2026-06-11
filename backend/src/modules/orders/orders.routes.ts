/**
 * Orders — list, get, create, update status, record payment.
 *
 * Create flow:
 *   1. Validate customer + business entity
 *   2. For each item, resolve final unitPrice:
 *        body.unitPrice (manual override) →
 *        customer.company.priceList.items[productId].customPrice →
 *        general price list item →
 *        product.defaultSalePrice
 *   3. Compute subtotal, total
 *   4. Insert order + items + (optional) initial payment + invoice in 1 TX
 *   5. Generate order code (DH000001, …) and invoice code (HD000001, …)
 */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { eq, and, desc, sql, gte, lte, isNull } from 'drizzle-orm'
import { db, pool } from '../../config/db.js'
import {
  orders,
  orderItems,
  payments,
  invoices,
  customers,
  companies,
  businessEntities,
  products,
  priceLists,
  priceListItems,
  units,
} from '../../db/schema/index.js'
import { requireAuth } from '../../middleware/auth.js'
import { ok, created, paginated } from '../../lib/response.js'
import { BadRequest, NotFound, Conflict } from '../../lib/errors.js'
import { parsePagination } from '../../lib/pagination.js'
import { queryOne } from '../../lib/sql.js'

export const orderRoutes = new Hono()
orderRoutes.use('*', requireAuth)

async function getGeneralPriceListId(): Promise<string | null> {
  const [row] = await db
    .select({ id: priceLists.id })
    .from(priceLists)
    .where(and(isNull(priceLists.companyId), eq(priceLists.isDefault, 'true')))
    .limit(1)
  if (row) return row.id
  const [any] = await db.select({ id: priceLists.id }).from(priceLists).where(isNull(priceLists.companyId)).limit(1)
  return any?.id ?? null
}

async function nextOrderCode(): Promise<string> {
  const r = await queryOne<{ c: number }>(sql`SELECT count(*)::int AS c FROM orders`)
  return `DH${String(Number(r?.c ?? 0) + 1).padStart(6, '0')}`
}

async function nextInvoiceCode(): Promise<string> {
  const r = await queryOne<{ c: number }>(sql`SELECT count(*)::int AS c FROM invoices`)
  return `HD${String(Number(r?.c ?? 0) + 1).padStart(6, '0')}`
}

const itemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().min(0).optional(),
})

const createSchema = z.object({
  customerId: z.string().uuid(),
  businessEntityId: z.string().uuid(),
  items: z.array(itemSchema).min(1).max(500),
  discount: z.coerce.number().min(0).default(0),
  paidAmount: z.coerce.number().min(0).default(0),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'card', 'other']).default('cash'),
  notes: z.string().max(500).optional(),
  generateInvoice: z.boolean().default(true),
})

const statusSchema = z.object({ status: z.enum(['draft', 'confirmed', 'completed', 'cancelled']) })

const paymentSchema = z.object({
  amount: z.coerce.number().positive(),
  method: z.enum(['cash', 'bank_transfer', 'card', 'other']).default('cash'),
  note: z.string().max(200).optional(),
})

orderRoutes.get('/', async (c) => {
  const { page, pageSize, offset, q } = parsePagination(c)
  const status = c.req.query('status')
  const customerId = c.req.query('customerId')
  const companyId = c.req.query('companyId')
  const from = c.req.query('from')
  const to = c.req.query('to')

  const conditions = []
  if (status) conditions.push(eq(orders.status, status as 'draft'))
  if (customerId) conditions.push(eq(orders.customerId, customerId))
  if (companyId) conditions.push(eq(customers.companyId, companyId))
  if (from) conditions.push(gte(orders.createdAt, new Date(from)))
  if (to) conditions.push(lte(orders.createdAt, new Date(to)))
  if (q) conditions.push(sql`(${orders.code} ILIKE ${`%${q}%`} OR ${customers.name} ILIKE ${`%${q}%`})`)
  const where = conditions.length ? and(...conditions) : undefined

  const [rows, [{ total = 0 } = { total: 0 }]] = await Promise.all([
    db
      .select({
        id: orders.id,
        code: orders.code,
        customerId: orders.customerId,
        customerName: customers.name,
        companyId: customers.companyId,
        businessEntityId: orders.businessEntityId,
        businessEntityName: businessEntities.name,
        status: orders.status,
        subtotal: orders.subtotal,
        discount: orders.discount,
        total: orders.total,
        paidAmount: orders.paidAmount,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .leftJoin(businessEntities, eq(orders.businessEntityId, businessEntities.id))
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .where(where),
  ])
  return paginated(c, rows, Number(total), page, pageSize)
})

orderRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')!
  const [order] = await db
    .select({
      id: orders.id,
      code: orders.code,
      customerId: orders.customerId,
      customerName: customers.name,
      customerCode: customers.code,
      companyId: customers.companyId,
      companyName: companies.name,
      businessEntityId: orders.businessEntityId,
      businessEntityName: businessEntities.name,
      status: orders.status,
      subtotal: orders.subtotal,
      discount: orders.discount,
      total: orders.total,
      paidAmount: orders.paidAmount,
      notes: orders.notes,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .leftJoin(companies, eq(customers.companyId, companies.id))
    .leftJoin(businessEntities, eq(orders.businessEntityId, businessEntities.id))
    .where(eq(orders.id, id))
    .limit(1)
  if (!order) throw NotFound('Đơn hàng không tồn tại')
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id)).orderBy(orderItems.sortOrder)
  const pays = await db.select().from(payments).where(eq(payments.orderId, id)).orderBy(payments.paidAt)
  return ok(c, { ...order, items, payments: pays })
})

orderRoutes.post('/', zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json')
  const user = c.get('user')

  const [customer] = await db
    .select({
      id: customers.id,
      name: customers.name,
      companyId: customers.companyId,
      priceListId: companies.priceListId,
    })
    .from(customers)
    .leftJoin(companies, eq(customers.companyId, companies.id))
    .where(eq(customers.id, body.customerId))
    .limit(1)
  if (!customer) throw NotFound('Khách hàng không tồn tại')
  const [be] = await db
    .select({ id: businessEntities.id })
    .from(businessEntities)
    .where(eq(businessEntities.id, body.businessEntityId))
    .limit(1)
  if (!be) throw NotFound('Hộ kinh doanh không tồn tại')

  const productIds = body.items.map((i) => i.productId)
  const productRows = await db
    .select({
      id: products.id,
      name: products.name,
      unitId: products.unitId,
      defaultSalePrice: products.defaultSalePrice,
    })
    .from(products)
    .where(sql`${products.id} = ANY(${productIds})`)
  const productMap = new Map(productRows.map((p) => [p.id, p]))
  for (const it of body.items) {
    if (!productMap.has(it.productId)) throw BadRequest(`Sản phẩm không tồn tại: ${it.productId}`)
  }

  const companyPlId = customer.priceListId
  const generalPlId = await getGeneralPriceListId()

  const priceLookup = new Map<string, number>()
  if (generalPlId) {
    const items = await db
      .select({ productId: priceListItems.productId, price: priceListItems.customPrice })
      .from(priceListItems)
      .where(and(eq(priceListItems.priceListId, generalPlId), sql`${priceListItems.productId} = ANY(${productIds})`))
    for (const i of items) priceLookup.set(i.productId, Number(i.price))
  }
  if (companyPlId && companyPlId !== generalPlId) {
    const items = await db
      .select({ productId: priceListItems.productId, price: priceListItems.customPrice })
      .from(priceListItems)
      .where(and(eq(priceListItems.priceListId, companyPlId), sql`${priceListItems.productId} = ANY(${productIds})`))
    for (const i of items) priceLookup.set(i.productId, Number(i.price))
  }

  const finalItems = body.items.map((it, idx) => {
    const p = productMap.get(it.productId)!
    const resolved =
      it.unitPrice !== undefined
        ? it.unitPrice
        : priceLookup.get(it.productId) ?? Number(p.defaultSalePrice)
    const lineTotal = Math.round(resolved * it.quantity)
    return {
      productId: it.productId,
      productName: p.name,
      unit: '',
      quantity: it.quantity,
      unitPrice: resolved,
      totalPrice: lineTotal,
      sortOrder: idx,
    }
  })

  const unitIds = finalItems
    .map((i) => productMap.get(i.productId)!.unitId)
    .filter((id): id is string => Boolean(id))
  if (unitIds.length > 0) {
    const unitRows = await db.select({ id: units.id, name: units.name }).from(units).where(sql`${units.id} = ANY(${unitIds})`)
    const unitMap = new Map(unitRows.map((u) => [u.id, u.name]))
    for (const it of finalItems) {
      const p = productMap.get(it.productId)!
      it.unit = p.unitId ? (unitMap.get(p.unitId) ?? '') : ''
    }
  }

  const subtotal = finalItems.reduce((s, it) => s + it.totalPrice, 0)
  if (body.discount > subtotal) throw BadRequest('Chiết khấu không được lớn hơn tổng tiền hàng')
  const total = subtotal - body.discount
  if (body.paidAmount > total) throw BadRequest('Tiền khách đưa không được lớn hơn tổng phải trả')

  const client = await pool.connect()
  let createdId: string
  let createdCode: string
  try {
    await client.query('BEGIN')
    const orderCode = await nextOrderCode()
    const orderRes = await client.query(
      `INSERT INTO orders
         (code, customer_id, business_entity_id, status, subtotal, discount, total, paid_amount, notes, created_by)
       VALUES ($1,$2,$3,'confirmed',$4,$5,$6,$7,$8,$9)
       RETURNING id, code`,
      [
        orderCode,
        body.customerId,
        body.businessEntityId,
        String(subtotal),
        String(body.discount),
        String(total),
        String(body.paidAmount),
        body.notes ?? null,
        user.sub,
      ]
    )
    createdId = orderRes.rows[0].id
    createdCode = orderRes.rows[0].code

    for (const it of finalItems) {
      await client.query(
        `INSERT INTO order_items
           (order_id, product_id, product_name, unit, quantity, unit_price, total_price, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [createdId, it.productId, it.productName, it.unit, String(it.quantity), String(it.unitPrice), String(it.totalPrice), it.sortOrder]
      )
    }

    if (body.paidAmount > 0) {
      await client.query(
        `INSERT INTO payments (order_id, amount, method, created_by) VALUES ($1,$2,$3,$4)`,
        [createdId, String(body.paidAmount), body.paymentMethod, user.sub]
      )
    }

    if (body.generateInvoice) {
      const invoiceCode = await nextInvoiceCode()
      await client.query(
        `INSERT INTO invoices
           (code, order_id, customer_id, business_entity_id, status, subtotal, discount, total, paid_amount)
         VALUES ($1,$2,$3,$4,'completed',$5,$6,$7,$8)`,
        [
          invoiceCode,
          createdId,
          body.customerId,
          body.businessEntityId,
          String(subtotal),
          String(body.discount),
          String(total),
          String(body.paidAmount),
        ]
      )
    }

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {})
    throw e
  } finally {
    client.release()
  }

  const [order] = await db
    .select({
      id: orders.id,
      code: orders.code,
      customerId: orders.customerId,
      customerName: customers.name,
      businessEntityId: orders.businessEntityId,
      status: orders.status,
      subtotal: orders.subtotal,
      discount: orders.discount,
      total: orders.total,
      paidAmount: orders.paidAmount,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .where(eq(orders.id, createdId))
    .limit(1)
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, createdId)).orderBy(orderItems.sortOrder)
  return c.json({ data: { ...order, items } }, 201)
})

orderRoutes.patch('/:id/status', zValidator('json', statusSchema), async (c) => {
  const id = c.req.param('id')!
  const { status } = c.req.valid('json')
  const [order] = await db.select({ id: orders.id, status: orders.status }).from(orders).where(eq(orders.id, id)).limit(1)
  if (!order) throw NotFound('Đơn hàng không tồn tại')
  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id))
  return ok(c, { id, status })
})

orderRoutes.post('/:id/payments', zValidator('json', paymentSchema), async (c) => {
  const id = c.req.param('id')!
  const payload = c.req.valid('json')
  const user = c.get('user')
  const [order] = await db
    .select({ id: orders.id, total: orders.total, paidAmount: orders.paidAmount })
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1)
  if (!order) throw NotFound('Đơn hàng không tồn tại')
  const newPaid = Number(order.paidAmount) + payload.amount
  if (newPaid > Number(order.total) + 0.01) throw BadRequest('Tổng tiền thanh toán vượt quá tổng đơn')

  await db.insert(payments).values({
    orderId: id,
    amount: String(payload.amount),
    method: payload.method,
    note: payload.note,
    createdBy: user.sub,
  })
  await db.update(orders).set({ paidAmount: String(newPaid), updatedAt: new Date() }).where(eq(orders.id, id))
  await db.update(invoices).set({ paidAmount: String(newPaid) }).where(eq(invoices.orderId, id))

  return created(c, { paidAmount: newPaid, remaining: Number(order.total) - newPaid })
})
