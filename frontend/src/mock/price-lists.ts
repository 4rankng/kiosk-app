import type { PriceList } from '@/types/price-list'
import { products } from './products'

// Helper to create a price list with custom prices
function makePriceList(id: string, name: string, companyId: string, priceMultiplier: number): PriceList {
  return {
    id,
    name,
    companyId,
    items: products.map((p) => ({
      productId: p.id,
      product: p,
      customPrice: Math.round(p.defaultSalePrice * priceMultiplier / 1000) * 1000,
    })),
  }
}

// General price list — default prices
export const generalPriceList: PriceList = {
  id: 'pl1',
  name: 'BẢNG GIÁ CHUNG',
  companyId: '',
  items: products.map((p) => ({
    productId: p.id,
    product: p,
    customPrice: p.defaultSalePrice,
  })),
}

export const priceLists: PriceList[] = [
  generalPriceList,
  makePriceList('pl2', 'BẢNG GIÁ CHUỖI POSEIDON', 'c1', 95),
  makePriceList('pl3', 'BẢNG GIÁ HỒNG HẠNH', 'c2', 90),
  makePriceList('pl4', 'BẢNG GIÁ CÔNG TY 3E', 'c3', 92),
  makePriceList('pl5', 'BẢNG GIÁ MỘC LIÊN', 'c4', 93),
  makePriceList('pl6', 'BẢNG GIÁ PANDORA', 'c5', 88),
  makePriceList('pl7', 'BẢNG GIÁ GOLDEN FORK', 'c6', 91),
  makePriceList('pl8', 'BẢNG GIÁ ĐẠI VIỆT', 'c7', 94),
  makePriceList('pl9', 'BẢNG GIÁ PHỐ PHỞ', 'c8', 96),
]
