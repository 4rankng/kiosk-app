/**
 * Business entities (Hộ kinh doanh) — used for invoice PDF headers.
 */
import { apiClient } from '@/lib/api-client'

export interface BusinessEntity {
  id: string
  name: string
  taxCode: string | null
  address: string | null
  phone: string | null
  email: string | null
  headerLines: string[]
}

export async function getBusinessEntities(): Promise<BusinessEntity[]> {
  const { data } = await apiClient.get<{ data: BusinessEntity[] }>('/api/business-entities')
  return data.data
}

export async function getBusinessEntityById(id: string): Promise<BusinessEntity> {
  const { data } = await apiClient.get<{ data: BusinessEntity }>(`/api/business-entities/${id}`)
  return data.data
}

export async function createBusinessEntity(input: Omit<BusinessEntity, 'id'>): Promise<BusinessEntity> {
  const { data } = await apiClient.post<{ data: BusinessEntity }>('/api/business-entities', input)
  return data.data
}

export async function updateBusinessEntity(id: string, input: Partial<Omit<BusinessEntity, 'id'>>): Promise<BusinessEntity> {
  const { data } = await apiClient.patch<{ data: BusinessEntity }>(`/api/business-entities/${id}`, input)
  return data.data
}

export async function deleteBusinessEntity(id: string): Promise<void> {
  await apiClient.delete(`/api/business-entities/${id}`)
}
