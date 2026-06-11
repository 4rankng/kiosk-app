/**
 * Categories service — backward-compatible.
 */
import { apiClient } from '@/lib/api-client'

export interface Category {
  id: string
  name: string
  parentId: string | null
  createdAt: string
}

export interface CategoryNode extends Category {
  children: Category[]
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<{ data: { items: Category[]; tree: CategoryNode[] } }>('/api/categories')
  return data.data.items
}

export async function getCategoryTree(): Promise<CategoryNode[]> {
  const { data } = await apiClient.get<{ data: { items: Category[]; tree: CategoryNode[] } }>('/api/categories')
  return data.data.tree
}

export async function createCategory(input: { name: string; parentId?: string | null }): Promise<Category> {
  const { data } = await apiClient.post<{ data: Category }>('/api/categories', input)
  return data.data
}

export async function updateCategory(id: string, input: { name?: string; parentId?: string | null }): Promise<Category> {
  const { data } = await apiClient.patch<{ data: Category }>(`/api/categories/${id}`, input)
  return data.data
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/api/categories/${id}`)
}
