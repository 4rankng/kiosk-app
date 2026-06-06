import { type Product } from './product'

export interface PriceListItem {
  productId: string
  product: Product
  customPrice: number
}

export interface PriceList {
  id: string
  name: string
  companyId: string
  items: PriceListItem[]
}
