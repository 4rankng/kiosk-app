/**
 * Customers (branches). Belong to a company; inherit the company's price list.
 */
import { apiClient } from '@/lib/api-client'

export interface Customer {
  id: string
  code: string
  name: string
  companyId: string
  companyName: string | null
  priceListId: string | null
  phone: string | null
  email: string | null
  taxId: string | null
  address: string | null
  isActive: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: { page: number; pageSize: number; total: number; totalPages: number }
}

export async function getCustomers(params?: {
  q?: string
  companyId?: string
  page?: number
  pageSize?: number
}): Promise<Customer[]> {
  const { data } = await apiClient.get<{ data: Customer[]; meta: PaginatedResponse<Customer>['meta'] }>(
    '/api/customers',
    { params: { ...params, pageSize: params?.pageSize ?? 500 } }
  )
  return data.data
}

export async function getCustomerById(id: string): Promise<Customer> {
  const { data } = await apiClient.get<{ data: Customer }>(`/api/customers/${id}`)
  return data.data
}

export async function createCustomer(input: {
  code: string
  name: string
  companyId: string
  phone?: string
  email?: string
  taxId?: string
  address?: string
  notes?: string
}): Promise<Customer> {
  const { data } = await apiClient.post<{ data: Customer }>('/api/customers', input)
  return data.data
}

export async function updateCustomer(
  id: string,
  input: {
    code?: string
    name?: string
    phone?: string
    email?: string
    taxId?: string
    address?: string
    notes?: string
  }
): Promise<Customer> {
  const { data } = await apiClient.patch<{ data: Customer }>(`/api/customers/${id}`, input)
  return data.data
}

export async function deleteCustomer(id: string): Promise<void> {
  await apiClient.delete(`/api/customers/${id}`)
}
