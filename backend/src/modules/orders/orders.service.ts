/**
 * Order service — business logic extracted from routes.
 *
 * Create flow:
 *   1. Validate customer + business entity
 *   2. For each item, resolve final unitPrice:
 *        body.unitPrice (manual override) ->
 *        customer.company.priceList.items[productId].customPrice ->
 *        general price list item ->
 *        product.defaultSalePrice
 *   3. Compute subtotal, total
 *   4. Insert order + items + (optional) initial payment + invoice in 1 TX
 *   5. Generate order code (DH000001, ...) and invoice code (HD000001, ...)
 */
import { eq, and, desc, sql, gte, lte, isNull, inArray, or, ilike } from 'drizzle-orm'
import { db } from '../../config/db.js'
import {
  orders,
  orderItems,
  payments,
  invoices,
  customers,
  companies,
  businessEntities,
  products,
  priceListItems,
  units,
} from '../../db/schema/index.js'
import { AppError, BadRequest, NotFound } from '../../lib/errors.js'
import { getGeneralPriceListId } from '../../lib/price-lists.js'

// ---------------------------------------------------------------------------
//  Sequence helpers — use raw SQL via db.execute (works inside Drizzle TX)
// ---------------------------------------------------------------------------

async function nextOrderCode(): Promise<string> {
  const result = await db.execute(sql`SELECT nextval('order_code_seq')::text AS nextval`)
  const rows = result.rows as Array<{ nextval: string }>
  return `DH${rows[0]!.nextval.padStart(6, '0')}`
}

async function nextInvoiceCode(): Promise<string> {
  const result = await db.execute(sql`SELECT nextval('invoice_code_seq')::text AS nextval`)
  const rows = result.rows as Array<{ nextval: string }>
  return `HD${rows[0]!.nextval.padStart(6, '0')}`
}

// ---------------------------------------------------------------------------
//  Types
// ---------------------------------------------------------------------------

interface CreateItemInput {
  productId: string
  quantity: number
  unitPrice?: number
}

interface CreateOrderInput {
  customerId: string
  businessEntityId: string
  items: CreateItemInput[]
  discount: number
  paidAmount: number
  paymentMethod: 'cash' | 'bank_transfer' | 'card' | 'other'
  notes?: string
  generateInvoice: boolean
}

// ---------------------------------------------------------------------------
//  Service
// ---------------------------------------------------------------------------

export const orderService = {
  /** List orders with filters and pagination. */
  async list(params: {
    page: number
    pageSize: number
    offset: number
    q?: string
    status?: string
    customerId?: string
    companyId?: string
    from?: string
    to?: string
  }) {
    const { page, pageSize, offset, q, status, customerId, companyId, from, to } = params

    const conditions = []
    if (status) conditions.push(eq(orders.status, status as 'draft'))
    if (customerId) conditions.push(eq(orders.customerId, customerId))
    if (companyId) conditions.push(eq(customers.companyId, companyId))
    if (from) conditions.push(gte(orders.createdAt, new Date(from)))
    if (to) conditions.push(lte(orders.createdAt, new Date(to)))
    if (q) conditions.push(or(ilike(orders.code, `%${q}%`), ilike(customers.name, `%${q}%`)))
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
    return { items: rows, total: Number(total) }
  },

  /** Get order detail with items and payments. */
  async getById(id: string) {
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
    return { ...order, items, payments: pays }
  },

  /**
   * Create an order with full price resolution in a Drizzle transaction.
   *
   * Price resolution priority:
   *   manual override → company price list → general price list → default sale price
   */
  async create(body: CreateOrderInput, createdBy: string) {
    return await db.transaction(async (tx) => {
      // 1. Validate customer + resolve company price list
      const [customer] = await tx
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

      // 2. Validate business entity
      const [be] = await tx
        .select({ id: businessEntities.id })
        .from(businessEntities)
        .where(eq(businessEntities.id, body.businessEntityId))
        .limit(1)
      if (!be) throw NotFound('Hộ kinh doanh không tồn tại')

      // 3. Resolve products
      const productIds = body.items.map((i) => i.productId)
      const productRows = await tx
        .select({
          id: products.id,
          name: products.name,
          unitId: products.unitId,
          defaultSalePrice: products.defaultSalePrice,
        })
        .from(products)
        .where(inArray(products.id, productIds))
      const productMap = new Map(productRows.map((p) => [p.id, p]))
      for (const it of body.items) {
        if (!productMap.has(it.productId)) throw BadRequest(`Sản phẩm không tồn tại: ${it.productId}`)
      }

      // 4. Resolve prices: manual override → company PL → general PL → default
      const companyPlId = customer.priceListId
      const generalPlId = await getGeneralPriceListId()

      const priceLookup = new Map<string, number>()
      if (generalPlId) {
        const plItems = await tx
          .select({ productId: priceListItems.productId, price: priceListItems.customPrice })
          .from(priceListItems)
          .where(and(eq(priceListItems.priceListId, generalPlId), inArray(priceListItems.productId, productIds)))
        for (const i of plItems) priceLookup.set(i.productId, Number(i.price))
      }
      if (companyPlId && companyPlId !== generalPlId) {
        const plItems = await tx
          .select({ productId: priceListItems.productId, price: priceListItems.customPrice })
          .from(priceListItems)
          .where(and(eq(priceListItems.priceListId, companyPlId), inArray(priceListItems.productId, productIds)))
        for (const i of plItems) priceLookup.set(i.productId, Number(i.price))
      }

      // 5. Resolve unit names
      const unitIds = productRows
        .map((p) => p.unitId)
        .filter((id): id is string => Boolean(id))
      const unitMap = new Map<string, string>()
      if (unitIds.length > 0) {
        const unitRows = await tx
          .select({ id: units.id, name: units.name })
          .from(units)
          .where(inArray(units.id, unitIds))
        for (const u of unitRows) unitMap.set(u.id, u.name)
      }

      // 6. Build final line items
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
          unit: p.unitId ? (unitMap.get(p.unitId) ?? '') : '',
          quantity: it.quantity,
          unitPrice: resolved,
          totalPrice: lineTotal,
          sortOrder: idx,
        }
      })

      const subtotal = finalItems.reduce((s, it) => s + it.totalPrice, 0)
      if (body.discount > subtotal) throw BadRequest('Chiết khấu không được lớn hơn tổng tiền hàng')
      const total = subtotal - body.discount
      if (body.paidAmount > total) throw BadRequest('Tiền khách đưa không được lớn hơn tổng phải trả')

      // 7. Insert order
      const orderCode = await nextOrderCode()
      const [orderRow] = await tx
        .insert(orders)
        .values({
          code: orderCode,
          customerId: body.customerId,
          businessEntityId: body.businessEntityId,
          status: 'confirmed',
          subtotal: String(subtotal),
          discount: String(body.discount),
          total: String(total),
          paidAmount: String(body.paidAmount),
          notes: body.notes ?? null,
          createdBy,
        })
        .returning()
      if (!orderRow) throw new AppError(500, 'Failed to create order')
      const createdId = orderRow.id

      // 8. Insert order items
      await tx.insert(orderItems).values(
        finalItems.map((it) => ({
          orderId: createdId,
          productId: it.productId,
          productName: it.productName,
          unit: it.unit,
          quantity: String(it.quantity),
          unitPrice: String(it.unitPrice),
          totalPrice: String(it.totalPrice),
          sortOrder: it.sortOrder,
        }))
      )

      // 9. Insert initial payment if any
      if (body.paidAmount > 0) {
        await tx.insert(payments).values({
          orderId: createdId,
          amount: String(body.paidAmount),
          method: body.paymentMethod,
          createdBy,
        })
      }

      // 10. Generate invoice if requested
      if (body.generateInvoice) {
        const invoiceCode = await nextInvoiceCode()
        await tx.insert(invoices).values({
          code: invoiceCode,
          orderId: createdId,
          customerId: body.customerId,
          businessEntityId: body.businessEntityId,
          status: 'completed',
          subtotal: String(subtotal),
          discount: String(body.discount),
          total: String(total),
          paidAmount: String(body.paidAmount),
        })
      }

      // 11. Fetch created order with joins for response
      const [order] = await tx
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
      if (!order) throw new AppError(500, 'Failed to fetch created order')
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, createdId)).orderBy(orderItems.sortOrder)
      return { ...order, items }
    })
  },

  /** Update order status. */
  async updateStatus(id: string, status: 'draft' | 'confirmed' | 'completed' | 'cancelled') {
    const [order] = await db.select({ id: orders.id, status: orders.status }).from(orders).where(eq(orders.id, id)).limit(1)
    if (!order) throw NotFound('Đơn hàng không tồn tại')
    await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id))
    return { id, status }
  },

  /** Record a payment against an order. All writes in a Drizzle transaction. */
  async recordPayment(id: string, payload: { amount: number; method: 'cash' | 'bank_transfer' | 'card' | 'other'; note?: string }, createdBy: string) {
    const [order] = await db
      .select({ id: orders.id, total: orders.total, paidAmount: orders.paidAmount })
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1)
    if (!order) throw NotFound('Đơn hàng không tồn tại')
    const newPaid = Number(order.paidAmount) + payload.amount
    if (newPaid > Number(order.total) + 0.01) throw BadRequest('Tổng tiền thanh toán vượt quá tổng đơn')

    await db.transaction(async (tx) => {
      await tx.insert(payments).values({
        orderId: id,
        amount: String(payload.amount),
        method: payload.method,
        note: payload.note ?? null,
        createdBy,
      })
      await tx
        .update(orders)
        .set({ paidAmount: String(newPaid), updatedAt: new Date() })
        .where(eq(orders.id, id))
      await tx
        .update(invoices)
        .set({ paidAmount: String(newPaid) })
        .where(eq(invoices.orderId, id))
    })

    return { paidAmount: newPaid, remaining: Number(order.total) - newPaid }
  },
}
