export interface Product {
  id: string
  code: string
  name: string
  description: string
  categoryId: string | null
  categoryName: string | null
  unitId: string | null
  unitName: string | null
  purchasePrice: number
  defaultSalePrice: number
  stockQuantity: number
  effectivePrice?: number
  isActive: string
}
