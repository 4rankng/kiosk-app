/**
 * Reports — server-side aggregations powered by raw SQL.
 *
 *   GET /api/reports/dashboard             — KPIs (today, this month, top 10, ...)
 *   GET /api/reports/monthly-revenue?month=YYYY-MM
 *   GET /api/reports/top-customers?month=&limit=
 *   GET /api/reports/products?from=&to=    — product-level sales rollup
 *   GET /api/reports/products/:id?from=&to — drill-down: which orders, which customers
 *   GET /api/reports/customer-debt?from=&to=&companyId=
 *   GET /api/reports/customer-debt.xlsx?…  — same data as Excel
 *   GET /api/reports/customer-debt.pdf?…   — same data as PDF
 */
import { Hono } from 'hono'
import { z } from 'zod'
import { requireAuth } from '../../middleware/auth.js'
import { anyRole } from '../../middleware/rbac.js'
import { ok } from '../../lib/response.js'
import { reportService } from './reports.service.js'

export const reportRoutes = new Hono()
reportRoutes.use('*', requireAuth, anyRole)

const querySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  month: z.string().optional(),
  companyId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
})

// ---------------------------------------------------------------------------
//  GET /api/reports/dashboard
// ---------------------------------------------------------------------------
reportRoutes.get('/dashboard', async (c) => {
  const data = await reportService.getDashboard()
  return ok(c, data)
})

// ---------------------------------------------------------------------------
//  GET /api/reports/monthly-revenue
// ---------------------------------------------------------------------------
reportRoutes.get('/monthly-revenue', async (c) => {
  const data = await reportService.getMonthlyRevenue(c.req.query('month'))
  return ok(c, data)
})

// ---------------------------------------------------------------------------
//  GET /api/reports/top-customers
// ---------------------------------------------------------------------------
reportRoutes.get('/top-customers', async (c) => {
  const q = querySchema.parse({ month: c.req.query('month'), limit: c.req.query('limit') })
  const data = await reportService.getTopCustomers(q.month, q.limit)
  return ok(c, data)
})

// ---------------------------------------------------------------------------
//  GET /api/reports/products
// ---------------------------------------------------------------------------
reportRoutes.get('/products', async (c) => {
  const data = await reportService.getProductReport(c.req.query('from'), c.req.query('to'))
  return ok(c, data)
})

// ---------------------------------------------------------------------------
//  GET /api/reports/products/:id
// ---------------------------------------------------------------------------
reportRoutes.get('/products/:id', async (c) => {
  const data = await reportService.getProductDetail(c.req.param('id')!, c.req.query('from'), c.req.query('to'))
  return ok(c, data)
})

// ---------------------------------------------------------------------------
//  GET /api/reports/customer-debt
// ---------------------------------------------------------------------------
reportRoutes.get('/customer-debt', async (c) => {
  const q = querySchema.parse({
    from: c.req.query('from'),
    to: c.req.query('to'),
    companyId: c.req.query('companyId'),
  })
  const data = await reportService.getCustomerDebt(q.from, q.to, q.companyId)
  return ok(c, data)
})

// ---------------------------------------------------------------------------
//  GET /api/reports/customer-debt.xlsx
// ---------------------------------------------------------------------------
reportRoutes.get('/customer-debt.xlsx', async (c) => {
  const q = querySchema.parse({
    from: c.req.query('from'),
    to: c.req.query('to'),
    companyId: c.req.query('companyId'),
  })
  const rows = await reportService.getDebtReportRows(q.from, q.to, q.companyId)
  const buf = await reportService.exportDebtXlsx(rows)
  c.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  c.header('Content-Disposition', `attachment; filename="customer-debt-${new Date().toISOString().slice(0, 10)}.xlsx"`)
  return c.body(buf as unknown as ArrayBuffer)
})

// ---------------------------------------------------------------------------
//  GET /api/reports/customer-debt.pdf
// ---------------------------------------------------------------------------
reportRoutes.get('/customer-debt.pdf', async (c) => {
  const q = querySchema.parse({
    from: c.req.query('from'),
    to: c.req.query('to'),
    companyId: c.req.query('companyId'),
  })
  const rows = await reportService.getDebtReportRows(q.from, q.to, q.companyId)
  const { fromIso, toIso } = (() => {
    const now = new Date()
    const defaultFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
    const from = q.from ? new Date(q.from) : defaultFrom
    const to = q.to ? new Date(q.to + 'T23:59:59') : now
    return { fromIso: from.toISOString(), toIso: to.toISOString() }
  })()
  const pdfBytes = await reportService.exportDebtPdf(rows, fromIso, toIso)
  c.header('Content-Type', 'application/pdf')
  c.header('Content-Disposition', `attachment; filename="customer-debt-${new Date().toISOString().slice(0, 10)}.pdf"`)
  return c.body(pdfBytes as unknown as ArrayBuffer)
})
