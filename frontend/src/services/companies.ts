/**
 * Companies (customer groups).
 */
import { apiClient } from '@/lib/api-client'

export interface Company {
  id: string
  name: string
  taxCode: string | null
  priceListId: string | null
  address: string | null
  phone: string | null
  email: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: { page: number; pageSize: number; total: number; totalPages: number }
}

export async function getCompanies(params?: { q?: string; page?: number; pageSize?: number }): Promise<PaginatedResponse<Company>> {
  const { data } = await apiClient.get<{ data: Company[]; meta: PaginatedResponse<Company>['meta'] }>('/api/companies', { params })
  return { data: data.data, meta: data.meta }
}

export async function getCompanyById(id: string): Promise<Company> {
  const { data } = await apiClient.get<{ data: Company }>(`/api/companies/${id}`)
  return data.data
}

export async function createCompany(input: Omit<Company, 'id'>): Promise<Company> {
  const { data } = await apiClient.post<{ data: Company }>('/api/companies', input)
  return data.data
}

export async function updateCompany(id: string, input: Partial<Omit<Company, 'id'>>): Promise<Company> {
  const { data } = await apiClient.patch<{ data: Company }>(`/api/companies/${id}`, input)
  return data.data
}

export async function deleteCompany(id: string): Promise<void> {
  await apiClient.delete(`/api/companies/${id}`)
}
