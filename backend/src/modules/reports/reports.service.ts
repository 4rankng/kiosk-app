/**
 * Reports service — all business logic for report generation.
 *
 * Extracted from reports.routes.ts for testability and reuse.
 */
import { sql } from 'drizzle-orm'
import ExcelJS from 'exceljs'
import { db } from '../../config/db.js'
import { renderInvoicePDF } from '../../lib/pdf.js'
import { query, queryOne } from '../../lib/sql.js'
import type { OrderItem } from '../../db/schema/orders.js'

// ---------------------------------------------------------------------------
//  Types
// ---------------------------------------------------------------------------
interface TodayAgg { revenue: number; orders: number; paid: number; unpaid: number }
interface DayAgg { revenue: number; orders: number }
interface CountAgg { count: number }
interface SumAgg { revenue: number }
interface WeekRow { week: string | Date; revenue: number }
interface TopCustomerRow { name: string; revenue: number }
interface TopProductRow { name: string; unit: string | null; quantity: number; revenue: number }
interface DebtRow { customer_name: string; amount: number }
interface RecentInvoiceRow {
  code: string
  customer_name: string
  total: number
  status: 'pending' | 'completed' | 'cancelled'
  is_paid: boolean
  issued_at: string
}
interface ProductAggRow {
  product_id: string
  product_code: string
  product_name: string
  unit: string | null
  total_quantity: number
  total_revenue: number
}
interface ProductDetailRow {
  invoice_code: string
  date: string
  customer_name: string
  quantity: number
  unit_price: number
  total: number
}
export interface DebtReportRow {
  customer_id: string
  customer_code: string
  customer_name: string
  company_id: string
  company_name: string
  total_revenue: number
  unpaid_amount: number
}
interface DebtExportRow {
  code: string
  customer_name: string
  company_name: string
  total_revenue: number
  unpaid_amount: number
}

// ---------------------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------------------
function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0)
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0)
}

function dateRange(q: { from?: string; to?: string }) {
  const now = new Date()
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
  const from = q.from ? new Date(q.from) : defaultFrom
  const to = q.to ? new Date(q.to + 'T23:59:59') : now
  return { fromIso: from.toISOString(), toIso: to.toISOString() }
}

// ---------------------------------------------------------------------------
//  Service
// ---------------------------------------------------------------------------
export const reportService = {
  // -------------------------------------------------------------------------
  //  Dashboard — KPIs
  // -------------------------------------------------------------------------
  async getDashboard() {
    const today = startOfDay(new Date())
    const todayEnd = endOfDay(new Date())
    const yesterday = startOfDay(new Date(Date.now() - 86400000))
    const yesterdayEnd = endOfDay(new Date(Date.now() - 86400000))
    const monthStart = startOfMonth(new Date())

    const [todayAgg, yesterdayAgg, pendingAgg, monthAgg, weekRows, topCustomers, topProducts, outstandingRows, recentInvoices] =
      await Promise.all([
        queryOne<TodayAgg>(db, sql`
          SELECT COALESCE(SUM(total), 0)::float AS revenue,
                 COUNT(*)::int AS orders,
                 COALESCE(SUM(CASE WHEN paid_amount >= total THEN total ELSE paid_amount END), 0)::float AS paid,
                 COALESCE(SUM(CASE WHEN paid_amount < total THEN total - paid_amount ELSE 0 END), 0)::float AS unpaid
          FROM invoices
          WHERE status = 'completed' AND issued_at BETWEEN ${today.toISOString()} AND ${todayEnd.toISOString()}
        `),
        queryOne<DayAgg>(db, sql`
          SELECT COALESCE(SUM(total), 0)::float AS revenue,
                 COUNT(*)::int AS orders
          FROM invoices
          WHERE status = 'completed' AND issued_at BETWEEN ${yesterday.toISOString()} AND ${yesterdayEnd.toISOString()}
        `),
        queryOne<CountAgg>(db, sql`
          SELECT COUNT(*)::int AS count
          FROM orders
          WHERE status = 'draft' AND created_at BETWEEN ${today.toISOString()} AND ${todayEnd.toISOString()}
        `),
        queryOne<SumAgg>(db, sql`
          SELECT COALESCE(SUM(total), 0)::float AS revenue
          FROM invoices
          WHERE status = 'completed' AND issued_at >= ${monthStart.toISOString()}
        `),
        query<WeekRow>(db, sql`
          SELECT date_trunc('week', issued_at) AS week,
                 COALESCE(SUM(total), 0)::float AS revenue
          FROM invoices
          WHERE status = 'completed' AND issued_at >= ${monthStart.toISOString()}
          GROUP BY 1
          ORDER BY 1
        `),
        query<TopCustomerRow>(db, sql`
          SELECT c.name,
                 COALESCE(SUM(i.total), 0)::float AS revenue
          FROM invoices i
          JOIN customers c ON c.id = i.customer_id
          WHERE i.status = 'completed' AND i.issued_at >= ${monthStart.toISOString()}
          GROUP BY c.name
          ORDER BY revenue DESC
          LIMIT 10
        `),
        query<TopProductRow>(db, sql`
          SELECT p.name, u.name AS unit,
                 COALESCE(SUM(oi.quantity::numeric), 0)::float AS quantity,
                 COALESCE(SUM(oi.total_price), 0)::float AS revenue
          FROM order_items oi
          JOIN orders o ON o.id = oi.order_id
          JOIN invoices i ON i.order_id = o.id
          JOIN products p ON p.id = oi.product_id
          LEFT JOIN units u ON u.id = p.unit_id
          WHERE i.status = 'completed' AND i.issued_at >= ${monthStart.toISOString()}
          GROUP BY p.name, u.name
          ORDER BY quantity DESC
          LIMIT 5
        `),
        query<DebtRow>(db, sql`
          SELECT c.name AS customer_name,
                 COALESCE(SUM(i.total - i.paid_amount), 0)::float AS amount
          FROM invoices i
          JOIN customers c ON c.id = i.customer_id
          WHERE i.status = 'completed' AND i.paid_amount < i.total
          GROUP BY c.name
          ORDER BY amount DESC
          LIMIT 5
        `),
        query<RecentInvoiceRow>(db, sql`
          SELECT i.code, c.name AS customer_name, i.total, i.status, i.paid_amount,
                 (i.paid_amount >= i.total) AS is_paid,
                 i.issued_at
          FROM invoices i
          JOIN customers c ON c.id = i.customer_id
          ORDER BY i.issued_at DESC
          LIMIT 5
        `),
      ])

    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const daysInMonth = new Date(year, month, 0).getDate()
    const pad = (n: number) => n.toString().padStart(2, '0')
    const weekLabels = [1, 8, 15, 22].map((s) => {
      const e = Math.min(s + 6, daysInMonth)
      return `${pad(s)}/${pad(month)}-${pad(e)}/${pad(month)}`
    })
    const weekBuckets = [0, 0, 0, 0]
    for (const row of weekRows) {
      const day = new Date(row.week).getDate()
      const idx = Math.min(Math.floor((day - 1) / 7), 3)
      weekBuckets[idx] = (weekBuckets[idx] ?? 0) + Number(row.revenue)
    }

    return {
      todayRevenue: Number(todayAgg?.revenue) || 0,
      todayOrders: Number(todayAgg?.orders) || 0,
      todayPending: Number(pendingAgg?.count) || 0,
      todayPaid: Number(todayAgg?.paid) || 0,
      todayUnpaid: Number(todayAgg?.unpaid) || 0,
      yesterdayRevenue: Number(yesterdayAgg?.revenue) || 0,
      yesterdayOrders: Number(yesterdayAgg?.orders) || 0,
      monthlyRevenue: weekBuckets.map((revenue, i) => ({ week: weekLabels[i]!, revenue })),
      topCustomers: topCustomers.map((c, i) => ({ rank: i + 1, name: c.name, revenue: Number(c.revenue) })),
      topProducts: topProducts.map((p, i) => ({
        rank: i + 1,
        name: p.name,
        unit: p.unit ?? '',
        quantity: Number(p.quantity),
        revenue: Number(p.revenue),
      })),
      outstandingDebts: outstandingRows.map((d) => ({ customerName: d.customer_name, amount: Number(d.amount) })),
      recentInvoices: recentInvoices.map((i) => ({
        code: i.code,
        customerName: i.customer_name,
        total: Number(i.total),
        status: i.status,
        isPaid: i.is_paid,
        date: i.issued_at,
      })),
    }
  },

  // -------------------------------------------------------------------------
  //  Monthly revenue — weekly buckets for a given month
  // -------------------------------------------------------------------------
  async getMonthlyRevenue(month?: string) {
    const ref = month ? new Date(`${month}-01`) : new Date()
    const monthStart = startOfMonth(ref)
    const next = new Date(ref.getFullYear(), ref.getMonth() + 1, 1)
    const daysInMonth = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate()
    const pad = (n: number) => n.toString().padStart(2, '0')
    const labels = [1, 8, 15, 22].map((s) => {
      const e = Math.min(s + 6, daysInMonth)
      return `${pad(s)}/${pad(monthStart.getMonth() + 1)}-${pad(e)}/${pad(monthStart.getMonth() + 1)}`
    })
    const rows = await query<WeekRow>(db, sql`
      SELECT date_trunc('week', issued_at) AS week, COALESCE(SUM(total), 0)::float AS revenue
      FROM invoices
      WHERE status = 'completed' AND issued_at >= ${monthStart.toISOString()} AND issued_at < ${next.toISOString()}
      GROUP BY 1
    `)
    const buckets = [0, 0, 0, 0]
    for (const r of rows) {
      const day = new Date(r.week).getDate()
      const i = Math.min(Math.floor((day - 1) / 7), 3)
      buckets[i] = (buckets[i] ?? 0) + Number(r.revenue)
    }
    return buckets.map((revenue, i) => ({ week: labels[i] ?? '', revenue }))
  },

  // -------------------------------------------------------------------------
  //  Top customers by revenue
  // -------------------------------------------------------------------------
  async getTopCustomers(month?: string, limit: number = 10) {
    const ref = month ? new Date(`${month}-01`) : new Date()
    const monthStart = startOfMonth(ref)
    const next = new Date(ref.getFullYear(), ref.getMonth() + 1, 1)
    const rows = await query<TopCustomerRow>(db, sql`
      SELECT c.name, COALESCE(SUM(i.total), 0)::float AS revenue
      FROM invoices i
      JOIN customers c ON c.id = i.customer_id
      WHERE i.status = 'completed' AND i.issued_at >= ${monthStart.toISOString()} AND i.issued_at < ${next.toISOString()}
      GROUP BY c.name
      ORDER BY revenue DESC
      LIMIT ${limit}
    `)
    return rows.map((r, i) => ({ rank: i + 1, name: r.name, revenue: Number(r.revenue) }))
  },

  // -------------------------------------------------------------------------
  //  Product report — aggregated sales rollup
  // -------------------------------------------------------------------------
  async getProductReport(from?: string, to?: string) {
    const { fromIso, toIso } = dateRange({ from, to })
    const rows = await query<ProductAggRow>(db, sql`
      SELECT p.id AS product_id, p.code AS product_code, p.name AS product_name,
             u.name AS unit,
             COALESCE(SUM(oi.quantity::numeric), 0)::float AS total_quantity,
             COALESCE(SUM(oi.total_price), 0)::float AS total_revenue
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN invoices i ON i.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      LEFT JOIN units u ON u.id = p.unit_id
      WHERE i.status = 'completed' AND i.issued_at BETWEEN ${fromIso} AND ${toIso}
      GROUP BY p.id, p.code, p.name, u.name
      ORDER BY total_revenue DESC
    `)
    return rows.map((r) => ({
      productId: r.product_id,
      productCode: r.product_code,
      productName: r.product_name,
      unit: r.unit ?? '',
      totalQuantity: Number(r.total_quantity),
      totalRevenue: Number(r.total_revenue),
    }))
  },

  // -------------------------------------------------------------------------
  //  Product detail — drill-down for a single product
  // -------------------------------------------------------------------------
  async getProductDetail(productId: string, from?: string, to?: string) {
    const { fromIso, toIso } = dateRange({ from, to })
    const summary = await queryOne<ProductAggRow>(db, sql`
      SELECT p.id AS product_id, p.code AS product_code, p.name AS product_name,
             u.name AS unit,
             COALESCE(SUM(oi.quantity::numeric), 0)::float AS total_quantity,
             COALESCE(SUM(oi.total_price), 0)::float AS total_revenue
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN invoices i ON i.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      LEFT JOIN units u ON u.id = p.unit_id
      WHERE i.status = 'completed' AND p.id = ${productId} AND i.issued_at BETWEEN ${fromIso} AND ${toIso}
      GROUP BY p.id, p.code, p.name, u.name
    `)
    const details = await query<ProductDetailRow>(db, sql`
      SELECT i.code AS invoice_code, i.issued_at AS date,
             c.name AS customer_name,
             oi.quantity::float AS quantity,
             oi.unit_price::float AS unit_price,
             oi.total_price::float AS total
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN invoices i ON i.order_id = o.id
      JOIN customers c ON c.id = i.customer_id
      WHERE i.status = 'completed' AND oi.product_id = ${productId} AND i.issued_at BETWEEN ${fromIso} AND ${toIso}
      ORDER BY i.issued_at DESC
    `)
    return {
      productId: summary?.product_id ?? productId,
      productCode: summary?.product_code ?? '',
      productName: summary?.product_name ?? '',
      unit: summary?.unit ?? '',
      totalQuantity: Number(summary?.total_quantity ?? 0),
      totalRevenue: Number(summary?.total_revenue ?? 0),
      details: details.map((d) => ({
        invoiceCode: d.invoice_code,
        date: d.date,
        customerName: d.customer_name,
        quantity: Number(d.quantity),
        unitPrice: Number(d.unit_price),
        total: Number(d.total),
      })),
    }
  },

  // -------------------------------------------------------------------------
  //  Shared debt report rows — used by JSON, XLSX, and PDF endpoints
  // -------------------------------------------------------------------------
  async getDebtReportRows(from?: string, to?: string, companyId?: string): Promise<DebtReportRow[]> {
    const { fromIso, toIso } = dateRange({ from, to })
    const companyFilter = companyId ? sql`AND c.company_id = ${companyId}` : sql``
    return query<DebtReportRow>(db, sql`
      SELECT c.id AS customer_id, c.code AS customer_code, c.name AS customer_name,
             co.id AS company_id, co.name AS company_name,
             COALESCE(SUM(i.total), 0)::float AS total_revenue,
             COALESCE(SUM(GREATEST(i.total - i.paid_amount, 0)), 0)::float AS unpaid_amount
      FROM invoices i
      JOIN customers c ON c.id = i.customer_id
      JOIN companies co ON co.id = c.company_id
      WHERE i.status = 'completed' AND i.issued_at BETWEEN ${fromIso} AND ${toIso}
        ${companyFilter}
      GROUP BY c.id, c.code, c.name, co.id, co.name
      ORDER BY total_revenue DESC
    `)
  },

  // -------------------------------------------------------------------------
  //  Customer debt — JSON response
  // -------------------------------------------------------------------------
  async getCustomerDebt(from?: string, to?: string, companyId?: string) {
    const rows = await this.getDebtReportRows(from, to, companyId)
    return rows.map((r) => ({
      customerId: r.customer_id,
      customerCode: r.customer_code,
      customerName: r.customer_name,
      companyId: r.company_id,
      companyName: r.company_name,
      totalRevenue: Number(r.total_revenue),
      unpaidAmount: Number(r.unpaid_amount),
    }))
  },

  // -------------------------------------------------------------------------
  //  Customer debt — XLSX export
  // -------------------------------------------------------------------------
  async exportDebtXlsx(rows: DebtReportRow[]) {
    const wb = new ExcelJS.Workbook()
    wb.creator = 'Kiosk'
    wb.created = new Date()
    const ws = wb.addWorksheet('Đối chiếu công nợ')
    ws.columns = [
      { header: 'Mã KH', key: 'code', width: 14 },
      { header: 'Tên chi nhánh', key: 'name', width: 36 },
      { header: 'Thuộc công ty', key: 'company', width: 28 },
      { header: 'Tổng tiền hàng (VND)', key: 'total', width: 22, style: { numFmt: '#,##0' } },
      { header: 'Tiền chưa thu (VND)', key: 'unpaid', width: 22, style: { numFmt: '#,##0' } },
    ]
    ws.getRow(1).font = { bold: true }
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFEFEF' } }
    for (const r of rows) {
      ws.addRow({
        code: r.customer_code,
        name: r.customer_name,
        company: r.company_name,
        total: Number(r.total_revenue),
        unpaid: Number(r.unpaid_amount),
      })
    }
    const total = rows.reduce((s, r) => s + Number(r.total_revenue), 0)
    const unpaid = rows.reduce((s, r) => s + Number(r.unpaid_amount), 0)
    const totalRow = ws.addRow({ code: '', name: 'TỔNG CỘNG', company: '', total, unpaid })
    totalRow.font = { bold: true }

    return wb.xlsx.writeBuffer()
  },

  // -------------------------------------------------------------------------
  //  Customer debt — PDF export
  // -------------------------------------------------------------------------
  async exportDebtPdf(rows: DebtReportRow[], fromIso: string, toIso: string) {
    const total = rows.reduce((s, r) => s + Number(r.total_revenue), 0)
    const unpaid = rows.reduce((s, r) => s + Number(r.unpaid_amount), 0)

    const fakeItems: OrderItem[] = rows.map((r, i) => ({
      id: r.customer_code,
      orderId: r.customer_code,
      productId: r.customer_code,
      productName: `[${r.customer_code}] ${r.customer_name} — ${r.company_name}`,
      unit: '',
      quantity: '1',
      unitPrice: String(r.unpaid_amount),
      totalPrice: String(r.unpaid_amount),
      sortOrder: i,
    }))

    return renderInvoicePDF({
      invoiceCode: `DEBT-${new Date().toISOString().slice(0, 10)}`,
      issuedAt: new Date().toISOString(),
      customer: {
        code: '',
        name: 'BÁO CÁO ĐỐI CHIẾU CÔNG NỢ',
      },
      businessEntity: {
        name: 'BÁO CÁO ĐỐI CHIẾU CÔNG NỢ',
        headerLines: [
          `Từ ngày: ${new Date(fromIso).toLocaleDateString('vi-VN')}`,
          `Đến ngày: ${new Date(toIso).toLocaleDateString('vi-VN')}`,
        ],
      },
      items: fakeItems,
      subtotal: total,
      discount: 0,
      total: unpaid,
      paidAmount: 0,
    })
  },
}
