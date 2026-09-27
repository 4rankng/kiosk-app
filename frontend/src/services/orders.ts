/**
 * Orders. Backward-compatible signatures.
 */
import { apiClient } from '@/lib/api-client'
import type { OrderDetail } from '@/types/api'
import type { OrderCreateInput } from '@kiosk/shared'

/** Order create payload — mirrors the backend via @kiosk/shared (no drift). */
export type CreateOrderInput = OrderCreateInput

export async function createOrder(input: CreateOrderInput): Promise<OrderDetail> {
  const { data } = await apiClient.post<{ data: OrderDetail }>('/api/orders', input)
  return data.data
}

export async function recordPayment(
  orderId: string,
  input: { amount: number; method?: 'cash' | 'bank_transfer' | 'card' | 'other'; note?: string }
): Promise<{ paidAmount: number; remaining: number }> {
  const { data } = await apiClient.post<{ data: { paidAmount: number; remaining: number } }>(`/api/orders/${orderId}/payments`, input)
  return data.data
}
