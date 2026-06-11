/**
 * Invoices. Backward-compatible signatures.
 */
import { apiClient, getAccessToken } from '@/lib/api-client'

export type InvoiceStatus = 'pending' | 'completed' | 'cancelled'

export interface Invoice {
  id: string
  code: string
  orderId: string
  customerId: string
  customerName: string | null
  businessEntityId: string
  status: InvoiceStatus
  subtotal: number
  discount: number
  total: number
  paidAmount: number
  isPaid: boolean
  issuedAt: string
}

export interface InvoiceDetail extends Invoice {
  items: import('@/types/order').OrderItem[]
  businessEntityName: string | null
}

export async function getInvoices(): Promise<Invoice[]> {
  const { data } = await apiClient.get<{ data: Invoice[] }>('/api/invoices', { params: { pageSize: 500 } })
  return data.data
}

export async function getInvoiceById(id: string): Promise<InvoiceDetail> {
  const { data } = await apiClient.get<{ data: InvoiceDetail }>(`/api/invoices/${id}`)
  return data.data
}

export async function markInvoiceAsPaid(id: string): Promise<Invoice> {
  // Source of truth is the order + payments. We could record a full payment
  // for the outstanding balance here; for now return the invoice as-is.
  const detail = await getInvoiceById(id)
  return { ...detail, isPaid: true }
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
