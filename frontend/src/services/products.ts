/**
 * Products. Backward-compatible signatures.
 */
import { apiClient } from '@/lib/api-client'

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
  isActive: string
}

export async function getProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<{ data: Product[] }>('/api/products', { params: { pageSize: 500 } })
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

export async function createProduct(input: Omit<Product, 'id' | 'categoryName' | 'unitName' | 'effectivePrice' | 'isActive'>): Promise<Product> {
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
