/**
 * Invoices. Backward-compatible signatures.
 */
import { apiClient, getAccessToken, DEFAULT_PAGE_SIZE } from '@/lib/api-client'
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

export async function downloadInvoicePdf(id: string, businessEntityId?: string): Promise<void> {
  const baseURL = apiClient.defaults.baseURL ?? ''
  const url = `${baseURL}/api/invoices/${id}/pdf${businessEntityId ? `?businessEntityId=${encodeURIComponent(businessEntityId)}` : ''}`
  const token = getAccessToken()
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error('Không thể tải hóa đơn')
  const blob = await res.blob()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `invoice-${id}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(a.href)
}
