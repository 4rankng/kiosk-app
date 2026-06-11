/**
 * Invoices — list, get detail, PDF download.
 *
 *   GET    /api/invoices              list with filters
 *   GET    /api/invoices/:id          detail (header + items)
 *   GET    /api/invoices/:id/pdf      PDF (A5), uses the business entity that
 *                                    was assigned at order time, OR ?businessEntityId=
 *                                    to render with a different one
 */
import { Hono } from 'hono'
import { eq, and, desc, sql, gte, lte, ilike, or } from 'drizzle-orm'
import { db } from '../../config/db.js'
import {
  invoices,
  orders,
  orderItems,
  customers,
  businessEntities,
} from '../../db/schema/index.js'
import { requireAuth } from '../../middleware/auth.js'
import { ok, paginated } from '../../lib/response.js'
import { NotFound } from '../../lib/errors.js'
import { parsePagination } from '../../lib/pagination.js'
import { renderInvoicePDF } from '../../lib/pdf.js'
import { AppError } from '../../lib/errors.js'

export const invoiceRoutes = new Hono()
invoiceRoutes.use('*', requireAuth)

// ---------------------------------------------------------------------------
//  GET /api/invoices
// ---------------------------------------------------------------------------
invoiceRoutes.get('/', async (c) => {
  const { page, pageSize, offset, q } = parsePagination(c)
  const status = c.req.query('status')
  const customerId = c.req.query('customerId')
  const from = c.req.query('from')
  const to = c.req.query('to')

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
  return paginated(c, rows, Number(total), page, pageSize)
})

// ---------------------------------------------------------------------------
//  GET /api/invoices/:id
// ---------------------------------------------------------------------------
invoiceRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')!
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
  return ok(c, { ...inv, items })
})

// ---------------------------------------------------------------------------
//  GET /api/invoices/:id/pdf
// ---------------------------------------------------------------------------
invoiceRoutes.get('/:id/pdf', async (c) => {
  const id = c.req.param('id')!
  const overrideEntityId = c.req.query('businessEntityId')

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

  const pdfBytes = await renderInvoicePDF({
    invoiceCode: inv.code,
    issuedAt: inv.issuedAt instanceof Date ? inv.issuedAt.toISOString() : (inv.issuedAt as unknown as string),
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
  })

  // Hono needs the body to be set via c.body
  c.header('Content-Type', 'application/pdf')
  c.header('Content-Disposition', `inline; filename="${inv.code}.pdf"`)
  c.header('Content-Length', String(pdfBytes.byteLength))
  return c.body(pdfBytes as unknown as ArrayBuffer)
})
