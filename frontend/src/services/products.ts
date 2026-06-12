/**
 * Products. Backward-compatible signatures.
 */
import { apiClient, DEFAULT_PAGE_SIZE } from '@/lib/api-client'
import type { Product } from '@/types/api'

export async function getProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<{ data: Product[] }>('/api/products', { params: { pageSize: DEFAULT_PAGE_SIZE } })
  return data.data
}

export async function getProductById(id: string, priceListId?: string): Promise<Product> {
  const { data } = await apiClient.get<{ data: Product }>(`/api/products/${id}`, { params: { priceListId } })
  return data.data
}

export async function searchProducts(query: string, priceListId?: string): Promise<Product[]> {
  const { data } = await apiClient.get<{ data: Product[] }>('/api/products', { params: { q: query, priceListId, pageSize: 50 } })
  return data.data
}

export async function createProduct(input: Partial<Omit<Product, 'id' | 'isActive' | 'categoryName' | 'unitName' | 'effectivePrice'>> & Pick<Product, 'code' | 'name'>): Promise<Product> {
  const { data } = await apiClient.post<{ data: Product }>('/api/products', input)
  return data.data
}

export async function updateProduct(id: string, input: Partial<Omit<Product, 'id'>>): Promise<Product> {
  const { data } = await apiClient.patch<{ data: Product }>(`/api/products/${id}`, input)
  return data.data
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/api/products/${id}`)
}
