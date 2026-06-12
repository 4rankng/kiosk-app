/**
 * Invoice service — business logic extracted from routes.
 */
import { eq, and, desc, sql, gte, lte, ilike, or } from 'drizzle-orm'
import { db } from '../../config/db.js'
import {
  invoices,
  orders,
  orderItems,
  customers,
  businessEntities,
} from '../../db/schema/index.js'
import { AppError, NotFound } from '../../lib/errors.js'

export const invoiceService = {
  /** List invoices with filters and pagination. */
  async list(params: {
    page: number
    pageSize: number
    offset: number
    q?: string
    status?: string
    customerId?: string
    from?: string
    to?: string
  }) {
    const { page, pageSize, offset, q, status, customerId, from, to } = params

    const conds = []
    if (status) conds.push(eq(invoices.status, status as 'completed'))
    if (customerId) conds.push(eq(invoices.customerId, customerId))
    if (from) conds.push(gte(invoices.issuedAt, new Date(from)))
    if (to) conds.push(lte(invoices.issuedAt, new Date(to)))
    if (q) conds.push(or(ilike(invoices.code, `%${q}%`), ilike(customers.name, `%${q}%`)))
    const where = conds.length ? and(...conds) : undefined

    const [rows, [{ total = 0 } = { total: 0 }]] = await Promise.all([
      db
        .select({
          id: invoices.id,
          code: invoices.code,
          orderId: invoices.orderId,
          customerId: invoices.customerId,
          customerName: customers.name,
          businessEntityId: invoices.businessEntityId,
          status: invoices.status,
          subtotal: invoices.subtotal,
          discount: invoices.discount,
          total: invoices.total,
          paidAmount: invoices.paidAmount,
          issuedAt: invoices.issuedAt,
        })
        .from(invoices)
        .leftJoin(customers, eq(invoices.customerId, customers.id))
        .where(where)
        .orderBy(desc(invoices.issuedAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ total: sql<number>`count(*)::int` })
        .from(invoices)
        .leftJoin(customers, eq(invoices.customerId, customers.id))
        .where(where),
    ])
    return { items: rows, total: Number(total) }
  },

  /** Get invoice detail (header + items). */
  async getById(id: string) {
    const [inv] = await db
      .select({
        id: invoices.id,
        code: invoices.code,
        orderId: invoices.orderId,
        customerId: invoices.customerId,
        customerName: customers.name,
        customerCode: customers.code,
        customerAddress: customers.address,
        customerPhone: customers.phone,
        customerTaxId: customers.taxId,
        businessEntityId: invoices.businessEntityId,
        businessEntityName: businessEntities.name,
        status: invoices.status,
        subtotal: invoices.subtotal,
        discount: invoices.discount,
        total: invoices.total,
        paidAmount: invoices.paidAmount,
        issuedAt: invoices.issuedAt,
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .leftJoin(businessEntities, eq(invoices.businessEntityId, businessEntities.id))
      .where(eq(invoices.id, id))
      .limit(1)
    if (!inv) throw NotFound('Hóa đơn không tồn tại')
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, inv.orderId))
      .orderBy(orderItems.sortOrder)
    return { ...inv, items }
  },

  /** Get invoice with full detail for PDF rendering. */
  async getForPdf(id: string, overrideEntityId?: string) {
    const [inv] = await db
      .select({
        id: invoices.id,
        code: invoices.code,
        orderId: invoices.orderId,
        customerId: invoices.customerId,
        customerName: customers.name,
        customerCode: customers.code,
        customerAddress: customers.address,
        customerPhone: customers.phone,
        customerTaxId: customers.taxId,
        businessEntityId: invoices.businessEntityId,
        businessEntityName: businessEntities.name,
        businessEntityTaxCode: businessEntities.taxCode,
        businessEntityAddress: businessEntities.address,
        businessEntityPhone: businessEntities.phone,
        businessEntityHeaderLines: businessEntities.headerLines,
        subtotal: invoices.subtotal,
        discount: invoices.discount,
        total: invoices.total,
        paidAmount: invoices.paidAmount,
        issuedAt: invoices.issuedAt,
        notes: orders.notes,
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .leftJoin(businessEntities, eq(invoices.businessEntityId, businessEntities.id))
      .leftJoin(orders, eq(invoices.orderId, orders.id))
      .where(eq(invoices.id, id))
      .limit(1)
    if (!inv) throw NotFound('Hóa đơn không tồn tại')

    let entityHeader = inv.businessEntityHeaderLines ?? []
    let entityName = inv.businessEntityName ?? ''
    let entityTaxCode = inv.businessEntityTaxCode
    let entityAddress = inv.businessEntityAddress
    let entityPhone = inv.businessEntityPhone

    if (overrideEntityId && overrideEntityId !== inv.businessEntityId) {
      const [override] = await db
        .select()
        .from(businessEntities)
        .where(eq(businessEntities.id, overrideEntityId))
        .limit(1)
      if (!override) throw new AppError(400, 'Hộ kinh doanh không tồn tại')
      entityHeader = override.headerLines
      entityName = override.name
      entityTaxCode = override.taxCode
      entityAddress = override.address
      entityPhone = override.phone
    }

    const orderItemsList = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, inv.orderId))
      .orderBy(orderItems.sortOrder)

    return {
      invoiceCode: inv.code,
      issuedAt: inv.issuedAt instanceof Date ? inv.issuedAt.toISOString() : String(inv.issuedAt),
      customer: {
        code: inv.customerCode ?? '',
        name: inv.customerName ?? '',
        address: inv.customerAddress,
        phone: inv.customerPhone,
        taxId: inv.customerTaxId,
      },
      businessEntity: {
        name: entityName,
        headerLines: entityHeader,
        taxCode: entityTaxCode,
        address: entityAddress,
        phone: entityPhone,
      },
      items: orderItemsList.map((it) => ({
        ...it,
        quantity: String(it.quantity),
      })),
      subtotal: Number(inv.subtotal),
      discount: Number(inv.discount),
      total: Number(inv.total),
      paidAmount: Number(inv.paidAmount),
      notes: inv.notes,
      code: inv.code,
    }
  },
}
