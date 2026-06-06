import type { Invoice } from '@/types/invoice'
import { getInvoices } from './invoices'

export interface ProductReportRow {
  productId: string
  productCode: string
  productName: string
  unit: string
  totalQuantity: number
  totalRevenue: number
  details: {
    invoiceCode: string
    date: string
    customerName: string
    quantity: number
    unitPrice: number
    total: number
  }[]
}

export interface CustomerReportRow {
  customerId: string
  customerCode: string
  customerName: string
  companyId: string
  companyName: string
  totalRevenue: number
  unpaidAmount: number
}

export interface DashboardStats {
  todayRevenue: number
  todayOrders: number
  todayPending: number
  monthlyRevenue: { week: string; revenue: number }[]
  topCustomers: { rank: number; name: string; revenue: number }[]
}

export async function getProductReport(
  dateStart?: string,
  dateEnd?: string
): Promise<ProductReportRow[]> {
  const invoices = await getInvoices()
  let filtered = invoices.filter((inv) => inv.status === 'completed')
  if (dateStart) filtered = filtered.filter((inv) => inv.date >= dateStart)
  if (dateEnd) filtered = filtered.filter((inv) => inv.date <= dateEnd + 'T23:59:59')

  const map = new Map<string, ProductReportRow>()
  for (const inv of filtered) {
    for (const item of inv.items) {
      if (!map.has(item.productId)) {
        map.set(item.productId, {
          productId: item.productId,
          productCode: '',
          productName: item.productName,
          unit: item.unit,
          totalQuantity: 0,
          totalRevenue: 0,
          details: [],
        })
      }
      const row = map.get(item.productId)!
      row.totalQuantity += item.quantity
      row.totalRevenue += item.total
      row.details.push({
        invoiceCode: inv.code,
        date: inv.date,
        customerName: inv.customerName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })
    }
  }

  return Array.from(map.values()).sort((a, b) => b.totalRevenue - a.totalRevenue)
}

export async function getCustomerReport(
  dateStart?: string,
  dateEnd?: string,
  companyId?: string
): Promise<CustomerReportRow[]> {
  const { getCompanies } = await import('./companies')
  const companies = await getCompanies()
  const companyMap = new Map(companies.map((c) => [c.id, c.name]))

  const invoices = await getInvoices()
  let filtered: Invoice[] = invoices.filter((inv) => inv.status === 'completed')
  if (dateStart) filtered = filtered.filter((inv) => inv.date >= dateStart)
  if (dateEnd) filtered = filtered.filter((inv) => inv.date <= dateEnd + 'T23:59:59')
  if (companyId) filtered = filtered.filter((inv) => inv.companyId === companyId)

  const map = new Map<string, CustomerReportRow>()
  for (const inv of filtered) {
    if (!map.has(inv.customerId)) {
      map.set(inv.customerId, {
        customerId: inv.customerId,
        customerCode: '',
        customerName: inv.customerName,
        companyId: inv.companyId,
        companyName: companyMap.get(inv.companyId) || 'Không xác định',
        totalRevenue: 0,
        unpaidAmount: 0,
      })
    }
    const row = map.get(inv.customerId)!
    row.totalRevenue += inv.total
    if (!inv.isPaid) row.unpaidAmount += inv.total - inv.paidAmount
  }

  return Array.from(map.values()).sort((a, b) => b.totalRevenue - a.totalRevenue)
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const invoices = await getInvoices()
  const today = new Date().toISOString().slice(0, 10)
  const todayInvoices = invoices.filter(
    (inv) => inv.date.slice(0, 10) === today && inv.status === 'completed'
  )
  const todayRevenue = todayInvoices.reduce((s, inv) => s + inv.total, 0)
  const todayOrders = todayInvoices.length
  const todayPending = invoices.filter(
    (inv) => inv.date.slice(0, 10) === today && inv.status === 'pending'
  ).length

  // Monthly revenue by week
  const monthStart = today.slice(0, 7)
  const monthInvoices = invoices.filter(
    (inv) => inv.date.slice(0, 7) === monthStart && inv.status === 'completed'
  )
  const weekRevenue = [0, 0, 0, 0]
  for (const inv of monthInvoices) {
    const day = new Date(inv.date).getDate()
    const week = Math.min(Math.floor((day - 1) / 7), 3)
    weekRevenue[week] += inv.total
  }

  // Top 10 customers
  const customerRevenue = new Map<string, { name: string; revenue: number }>()
  for (const inv of monthInvoices) {
    const existing = customerRevenue.get(inv.customerId)
    if (existing) {
      existing.revenue += inv.total
    } else {
      customerRevenue.set(inv.customerId, { name: inv.customerName, revenue: inv.total })
    }
  }
  const topCustomers = Array.from(customerRevenue.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map((c, i) => ({ rank: i + 1, ...c }))

  return {
    todayRevenue,
    todayOrders,
    todayPending,
    monthlyRevenue: weekRevenue.map((revenue, i) => ({
      week: `Tuần ${i + 1}`,
      revenue,
    })),
    topCustomers,
  }
}
