import { type OrderItem } from './order'

export type InvoiceStatus = 'completed' | 'pending' | 'cancelled'

export interface Invoice {
  id: string
  code: string
  orderId: string
  customerId: string
  customerName: string
  companyId: string
  date: string
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  businessEntityId: string
  status: InvoiceStatus
  isPaid: boolean
  paidAmount: number
}
