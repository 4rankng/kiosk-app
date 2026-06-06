export type OrderStatus = 'draft' | 'confirmed' | 'completed'

export interface OrderItem {
  productId: string
  productName: string
  unit: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Order {
  id: string
  code: string
  customerId: string
  customerName: string
  companyId: string
  date: string
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  businessEntityId: string
  status: OrderStatus
}
