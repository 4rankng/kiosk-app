/**
 * Reports. Replaces client-side rollups with backend aggregations.
 */
import { apiClient, getAccessToken } from '@/lib/api-client'
import type { InvoiceStatus } from '@/types/api'

export interface ProductReportRow {
  productId: string
  productCode: string
  productName: string
  unit: string
  totalQuantity: number
  totalRevenue: number
  details: Array<{
    invoiceCode: string
    date: string
    customerName: string
    quantity: number
    unitPrice: number
    total: number
  }>
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
  monthlyRevenue: Array<{ week: string; revenue: number }>
  topCustomers: Array<{ rank: number; name: string; revenue: number }>
  yesterdayRevenue: number
  yesterdayOrders: number
  topProducts: Array<{ rank: number; name: string; unit: string; quantity: number; revenue: number }>
  outstandingDebts: Array<{ customerName: string; amount: number }>
  recentInvoices: Array<{ code: string; customerName: string; total: number; status: InvoiceStatus; isPaid: boolean; date: string }>
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get<{ data: DashboardStats }>('/api/reports/dashboard')
  return data.data
}

export async function getProductReport(dateStart?: string, dateEnd?: string): Promise<ProductReportRow[]> {
  const { data } = await apiClient.get<{ data: ProductReportRow[] }>('/api/reports/products', {
    params: { from: dateStart, to: dateEnd },
  })
  return data.data
}

export async function getProductReportDetails(productId: string, dateStart?: string, dateEnd?: string): Promise<ProductReportRow> {
  const { data } = await apiClient.get<{ data: ProductReportRow }>(`/api/reports/products/${productId}`, {
    params: { from: dateStart, to: dateEnd },
  })
  return data.data
}

export async function getCustomerReport(
  dateStart?: string,
  dateEnd?: string,
  companyId?: string
): Promise<CustomerReportRow[]> {
  const { data } = await apiClient.get<{ data: CustomerReportRow[] }>('/api/reports/customer-debt', {
    params: { from: dateStart, to: dateEnd, companyId },
  })
  return data.data
}

export async function downloadCustomerDebtXlsx(dateStart?: string, dateEnd?: string, companyId?: string): Promise<void> {
  const baseURL = apiClient.defaults.baseURL ?? ''
  const qs = new URLSearchParams()
  if (dateStart) qs.set('from', dateStart)
  if (dateEnd) qs.set('to', dateEnd)
  if (companyId) qs.set('companyId', companyId)
  const url = `${baseURL}/api/reports/customer-debt.xlsx${qs.toString() ? `?${qs}` : ''}`
  const token = getAccessToken()
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  if (!res.ok) throw new Error('Không thể tải file Excel')
  const blob = await res.blob()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `customer-debt-${new Date().toISOString().slice(0, 10)}.xlsx`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(a.href)
}
