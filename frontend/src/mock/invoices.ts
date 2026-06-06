import type { Invoice } from '@/types/invoice'
import { orders } from './orders'

// Derive invoices from orders with payment status
export const invoices: Invoice[] = orders.map((order, idx) => {
  const isPaid = idx % 3 !== 1 // ~2/3 are paid
  return {
    ...order,
    id: `inv-${order.id}`,
    code: order.code.replace('DH', 'HD'),
    orderId: order.id,
    status: order.status === 'completed' ? 'completed' as const : 'pending' as const,
    isPaid,
    paidAmount: isPaid ? order.total : 0,
  }
})
