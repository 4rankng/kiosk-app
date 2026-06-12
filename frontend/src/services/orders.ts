/**
 * Orders. Backward-compatible signatures.
 */
import { apiClient, DEFAULT_PAGE_SIZE } from '@/lib/api-client'
import type { Order, OrderDetail, OrderStatus } from '@/types/api'

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
  const { data } = await apiClient.get<{ data: Order[] }>('/api/orders', { params: { pageSize: DEFAULT_PAGE_SIZE } })
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
