/**
 * Categories service — backward-compatible.
 */
import { apiClient } from '@/lib/api-client'
import type { Category, CategoryNode } from '@/types/api'

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<{ data: { items: Category[]; tree: CategoryNode[] } }>('/api/categories')
  return data.data.items
}

export async function createCategory(input: { name: string; parentId?: string | null }): Promise<Category> {
  const { data } = await apiClient.post<{ data: Category }>('/api/categories', input)
  return data.data
}
