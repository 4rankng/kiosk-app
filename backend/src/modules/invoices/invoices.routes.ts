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
import { requireAuth } from '../../middleware/auth.js'
import { anyRole } from '../../middleware/rbac.js'
import { ok, paginated } from '../../lib/response.js'
import { parsePagination } from '../../lib/pagination.js'
import { renderInvoicePDF } from '../../lib/pdf.js'
import { invoiceService } from './invoices.service.js'

export const invoiceRoutes = new Hono()
invoiceRoutes.use('*', requireAuth, anyRole)

// ---------------------------------------------------------------------------
//  GET /api/invoices
// ---------------------------------------------------------------------------
invoiceRoutes.get('/', async (c) => {
  const { page, pageSize, offset, q } = parsePagination(c)
  const status = c.req.query('status')
  const customerId = c.req.query('customerId')
  const from = c.req.query('from')
  const to = c.req.query('to')
  const { items, total } = await invoiceService.list({ page, pageSize, offset, q, status, customerId, from, to })
  return paginated(c, items, total, page, pageSize)
})

// ---------------------------------------------------------------------------
//  GET /api/invoices/:id
// ---------------------------------------------------------------------------
invoiceRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')!
  const data = await invoiceService.getById(id)
  return ok(c, data)
})

// ---------------------------------------------------------------------------
//  GET /api/invoices/:id/pdf
// ---------------------------------------------------------------------------
invoiceRoutes.get('/:id/pdf', async (c) => {
  const id = c.req.param('id')!
  const overrideEntityId = c.req.query('businessEntityId')
  const data = await invoiceService.getForPdf(id, overrideEntityId)

  const pdfBytes = await renderInvoicePDF({
    invoiceCode: data.invoiceCode,
    issuedAt: data.issuedAt,
    customer: data.customer,
    businessEntity: data.businessEntity,
    items: data.items,
    subtotal: data.subtotal,
    discount: data.discount,
    total: data.total,
    paidAmount: data.paidAmount,
    notes: data.notes,
  })

  c.header('Content-Type', 'application/pdf')
  c.header('Content-Disposition', `inline; filename="${data.code}.pdf"`)
  c.header('Content-Length', String(pdfBytes.byteLength))
  return c.body(pdfBytes as unknown as ArrayBuffer)
})
