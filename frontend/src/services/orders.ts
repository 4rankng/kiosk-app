/**
 * Orders. Backward-compatible signatures.
 */
import { apiClient } from '@/lib/api-client'
import type { OrderItem, OrderStatus } from '@/types/order'

export interface Order {
  id: string
  code: string
  customerId: string
  customerName: string | null
  companyId: string | null
  businessEntityId: string
  businessEntityName: string | null
  status: OrderStatus
  subtotal: number
  discount: number
  total: number
  paidAmount: number
  notes: string | null
  createdAt: string
}

export interface OrderDetail extends Order {
  customerCode: string | null
  companyName: string | null
  items: OrderItem[]
  payments: Array<{
    id: string
    amount: number
    method: string
    paidAt: string
    note: string | null
  }>
}

export interface CreateOrderInput {
  customerId: string
  businessEntityId: string
  items: Array<{ productId: string; quantity: number; unitPrice?: number }>
  discount?: number
  paidAmount?: number
  paymentMethod?: 'cash' | 'bank_transfer' | 'card' | 'other'
  notes?: string
  generateInvoice?: boolean
}

export async function getOrders(): Promise<Order[]> {
  const { data } = await apiClient.get<{ data: Order[] }>('/api/orders', { params: { pageSize: 500 } })
  return data.data
}

export async function getOrderById(id: string): Promise<OrderDetail> {
  const { data } = await apiClient.get<{ data: OrderDetail }>(`/api/orders/${id}`)
  return data.data
}

export async function createOrder(input: CreateOrderInput): Promise<OrderDetail> {
  const { data } = await apiClient.post<{ data: OrderDetail }>('/api/orders', input)
  return data.data
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<{ id: string; status: OrderStatus }> {
  const { data } = await apiClient.patch<{ data: { id: string; status: OrderStatus } }>(`/api/orders/${id}/status`, { status })
  return data.data
}

export async function recordPayment(
  orderId: string,
  input: { amount: number; method?: 'cash' | 'bank_transfer' | 'card' | 'other'; note?: string }
): Promise<{ paidAmount: number; remaining: number }> {
  const { data } = await apiClient.post<{ data: { paidAmount: number; remaining: number } }>(`/api/orders/${orderId}/payments`, input)
  return data.data
}
