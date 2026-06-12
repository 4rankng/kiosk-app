/**
 * Shared entity types — single source of truth for all frontend services.
 * These mirror the backend API response shapes.
 */

// ---------------------------------------------------------------------------
//  Core entities
// ---------------------------------------------------------------------------

export interface Category {
  id: string
  name: string
  parentId: string | null
  createdAt: string
}

export interface CategoryNode extends Category {
  children: Category[]
}

export interface Unit {
  id: string
  name: string
  abbreviation: string | null
  createdAt: string
}

export interface Product {
  id: string
  code: string
  name: string
  description: string
  categoryId: string | null
  categoryName?: string | null
  unitId: string | null
  unitName?: string | null
  purchasePrice: number
  defaultSalePrice: number
  stockQuantity: number
  effectivePrice?: number
  isActive: boolean
}

export interface Company {
  id: string
  name: string
  taxCode: string | null
  priceListId: string | null
  address: string | null
  phone: string | null
  email: string | null
}

export interface Customer {
  id: string
  code: string
  name: string
  companyId: string
  companyName: string | null
  priceListId: string | null
  phone: string | null
  email: string | null
  taxId: string | null
  address: string | null
  isActive: boolean
}

export interface BusinessEntity {
  id: string
  name: string
  taxCode: string | null
  address: string | null
  phone: string | null
  email: string | null
  headerLines: string[]
}

// ---------------------------------------------------------------------------
//  Price lists
// ---------------------------------------------------------------------------

export interface PriceListItem {
  productId: string
  code: string
  name: string
  unit: string
  stockQuantity: number
  basePrice: number
  customPrice: number
  hasOverride: boolean
}

export interface PriceList {
  id: string
  name: string
  companyId: string | null
  companyName: string | null
  isDefault: string
  description: string | null
  itemCount: number
}

// ---------------------------------------------------------------------------
//  Orders
// ---------------------------------------------------------------------------

export type OrderStatus = 'draft' | 'confirmed' | 'completed' | 'cancelled'

export interface OrderItem {
  id?: string
  productId: string
  productName: string
  unit: string
  quantity: number
  unitPrice: number
  total: number
  totalPrice?: number
  sortOrder?: number
}

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

// ---------------------------------------------------------------------------
//  Invoices
// ---------------------------------------------------------------------------

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
  items: OrderItem[]
  businessEntityName: string | null
}
