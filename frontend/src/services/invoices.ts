/**
 * Invoices. Backward-compatible signatures.
 */
import { apiClient, DEFAULT_PAGE_SIZE } from '@/lib/api-client'
import type { Invoice, InvoiceDetail } from '@/types/api'

export async function getInvoices(): Promise<Invoice[]> {
  const { data } = await apiClient.get<{ data: Invoice[] }>('/api/invoices', { params: { pageSize: DEFAULT_PAGE_SIZE } })
  return data.data
}

export async function getInvoiceById(id: string): Promise<InvoiceDetail> {
  const { data } = await apiClient.get<{ data: InvoiceDetail }>(`/api/invoices/${id}`)
  return data.data
}

export async function markInvoiceAsPaid(id: string): Promise<InvoiceDetail> {
  // Record full payment for the outstanding balance via the order's payment endpoint
  const detail = await getInvoiceById(id)
  const outstanding = detail.total - detail.paidAmount
  if (outstanding <= 0) return detail
  await apiClient.post(
    `/api/orders/${detail.orderId}/payments`,
    { amount: outstanding, method: 'cash', note: 'Thanh toán hóa đơn' }
  )
  // Re-fetch invoice to get updated paid state
  return getInvoiceById(id)
}
