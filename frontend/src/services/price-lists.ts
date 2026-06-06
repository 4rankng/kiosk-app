import type { PriceList } from '@/types/price-list'
import { priceLists } from '@/mock/price-lists'
import { sleep } from '@/lib/utils'

export async function getPriceLists(): Promise<PriceList[]> {
  await sleep(300)
  return [...priceLists]
}

export async function getPriceListById(id: string): Promise<PriceList | undefined> {
  await sleep(200)
  return priceLists.find((pl) => pl.id === id)
}

export async function getPriceListByCompany(companyId: string): Promise<PriceList | undefined> {
  await sleep(200)
  return priceLists.find((pl) => pl.companyId === companyId)
}

export async function savePriceList(priceList: PriceList): Promise<PriceList> {
  await sleep(500)
  const idx = priceLists.findIndex((pl) => pl.id === priceList.id)
  if (idx !== -1) {
    priceLists[idx] = priceList
  } else {
    priceLists.push(priceList)
  }
  return priceList
}

export async function createPriceList(name: string, companyId: string): Promise<PriceList> {
  await sleep(500)
  const { products } = await import('@/mock/products')
  const newPriceList: PriceList = {
    id: `pl${Date.now()}`,
    name,
    companyId,
    items: products.map((p) => ({
      productId: p.id,
      product: p,
      customPrice: p.defaultSalePrice,
    })),
  }
  priceLists.push(newPriceList)
  return newPriceList
}
