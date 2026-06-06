import type { Order } from '@/types/order'
import { orders } from '@/mock/orders'
import { sleep } from '@/lib/utils'

export async function getOrders(): Promise<Order[]> {
  await sleep(300)
  return [...orders]
}

export async function createOrder(order: Omit<Order, 'id' | 'code'>): Promise<Order> {
  await sleep(500)
  const newOrder: Order = {
    ...order,
    id: `o${Date.now()}`,
    code: `DH${String(1541 + orders.length).padStart(6, '0')}`,
  }
  orders.unshift(newOrder)
  return newOrder
}
