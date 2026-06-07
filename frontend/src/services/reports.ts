import type { Invoice, InvoiceStatus } from '@/types/invoice'
import { products } from '@/mock/products'
import { customers } from '@/mock/customers'
import { getInvoices } from './invoices'

const productCodeMap = new Map(products.map((p) => [p.id, p.code]))
const customerCodeMap = new Map(customers.map((c) => [c.id, c.code]))

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
  todayPaid: number
  todayUnpaid: number
  monthlyRevenue: { week: string; revenue: number }[]
  topCustomers: { rank: number; name: string; revenue: number }[]
  // Trend comparison
  yesterdayRevenue: number
  yesterdayOrders: number
  // Product performance
  topProducts: {
    rank: number
    name: string
    unit: string
    quantity: number
    revenue: number
  }[]
  // Outstanding debts
  outstandingDebts: { customerName: string; amount: number }[]
  // Recent activity
  recentInvoices: {
    code: string
    customerName: string
    total: number
    status: InvoiceStatus
    isPaid: boolean
    date: string
  }[]
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
          productCode: productCodeMap.get(item.productId) ?? '',
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
        customerCode: customerCodeMap.get(inv.customerId) ?? '',
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
  const todayPaid = todayInvoices
    .filter((inv) => inv.isPaid)
    .reduce((s, inv) => s + inv.total, 0)
  const todayUnpaid = todayInvoices
    .filter((inv) => !inv.isPaid)
    .reduce((s, inv) => s + (inv.total - inv.paidAmount), 0)
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

  // Generate DD/MM labels for each week of the current month
  const year = parseInt(today.slice(0, 4))
  const month = parseInt(today.slice(5, 7))
  const daysInMonth = new Date(year, month, 0).getDate()
  const pad = (n: number) => n.toString().padStart(2, '0')
  const weekLabels = [1, 8, 15, 22].map((startDay) => {
    const endDay = Math.min(startDay + 6, daysInMonth)
    return `${pad(startDay)}/${pad(month)}-${pad(endDay)}/${pad(month)}`
  })

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

  // Yesterday comparison
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const yesterdayInvoices = invoices.filter(
    (inv) => inv.date.slice(0, 10) === yesterday && inv.status === 'completed'
  )
  const yesterdayRevenue = yesterdayInvoices.reduce((s, inv) => s + inv.total, 0)
  const yesterdayOrders = yesterdayInvoices.length

  // Top 5 products this month
  const productNameMap = new Map(products.map((p) => [p.id, { name: p.name, unit: p.unit }]))
  const productQty = new Map<string, { name: string; unit: string; quantity: number; revenue: number }>()
  for (const inv of monthInvoices) {
    for (const item of inv.items) {
      const existing = productQty.get(item.productId)
      if (existing) {
        existing.quantity += item.quantity
        existing.revenue += item.total
      } else {
        const info = productNameMap.get(item.productId)
        productQty.set(item.productId, {
          name: info?.name ?? item.productName,
          unit: info?.unit ?? item.unit,
          quantity: item.quantity,
          revenue: item.total,
        })
      }
    }
  }
  const topProducts = Array.from(productQty.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map((p, i) => ({ rank: i + 1, ...p }))

  // Outstanding debts (all completed + unpaid)
  const debtMap = new Map<string, { customerName: string; amount: number }>()
  for (const inv of invoices) {
    if (inv.status === 'completed' && !inv.isPaid) {
      const debt = inv.total - inv.paidAmount
      const existing = debtMap.get(inv.customerId)
      if (existing) {
        existing.amount += debt
      } else {
        debtMap.set(inv.customerId, { customerName: inv.customerName, amount: debt })
      }
    }
  }
  const outstandingDebts = Array.from(debtMap.values())
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  // Recent invoices (latest 5)
  const recentInvoices = [...invoices]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map((inv) => ({
      code: inv.code,
      customerName: inv.customerName,
      total: inv.total,
      status: inv.status,
      isPaid: inv.isPaid,
      date: inv.date,
    }))

  return {
    todayRevenue,
    todayOrders,
    todayPending,
    todayPaid,
    todayUnpaid,
    monthlyRevenue: weekRevenue.map((revenue, i) => ({
      week: weekLabels[i],
      revenue,
    })),
    topCustomers,
    yesterdayRevenue,
    yesterdayOrders,
    topProducts,
    outstandingDebts,
    recentInvoices,
  }
}
