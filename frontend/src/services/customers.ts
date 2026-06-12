/**
 * Customers (branches). Belong to a company; inherit the company's price list.
 */
import { apiClient, DEFAULT_PAGE_SIZE, type PaginatedResponse } from '@/lib/api-client'
import type { Customer } from '@/types/api'

export async function getCustomers(params?: {
  q?: string
  companyId?: string
  page?: number
  pageSize?: number
}): Promise<PaginatedResponse<Customer>> {
  const { data: body } = await apiClient.get<PaginatedResponse<Customer>>(
    '/api/customers',
    { params: { ...params, pageSize: params?.pageSize ?? DEFAULT_PAGE_SIZE } }
  )
  return body
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
