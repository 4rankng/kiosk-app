/**
 * Price lists. Backward-compatible signatures.
 */
import { apiClient } from '@/lib/api-client'
import type { PriceList, PriceListItem } from '@/types/api'

export async function getPriceLists(companyId?: string | null): Promise<PriceList[]> {
  const { data } = await apiClient.get<{ data: PriceList[] }>('/api/price-lists', {
    params: { companyId: companyId === undefined ? undefined : companyId ?? 'null' },
  })
  return data.data
}

export async function getPriceListById(id: string): Promise<{ priceList: PriceList; items: PriceListItem[] }> {
  const { data } = await apiClient.get<{ data: { priceList: PriceList; items: PriceListItem[] } }>(`/api/price-lists/${id}/items`)
  return data.data
}

export async function getPriceListByCompany(companyId: string): Promise<PriceList | undefined> {
  const lists = await getPriceLists(companyId)
  return lists.find((pl) => pl.companyId === companyId)
}

export async function createPriceList(input: {
  name: string
  companyId?: string | null
  description?: string
  isDefault?: boolean
}): Promise<PriceList> {
  const { data } = await apiClient.post<{ data: PriceList }>('/api/price-lists', input)
  return data.data
}

export async function bulkUpsertPriceListItems(
  priceListId: string,
  items: Array<{ productId: string; customPrice: number }>
): Promise<{ upserted: number }> {
  const { data } = await apiClient.put<{ data: { upserted: number } }>(`/api/price-lists/${priceListId}/items`, { items })
  return data.data
}

export async function deletePriceList(id: string): Promise<void> {
  await apiClient.delete(`/api/price-lists/${id}`)
}
