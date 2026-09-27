/**
 * Business entities (Hộ kinh doanh) — used for invoice PDF headers.
 */
import { apiClient } from '@/lib/api-client'
import type { BusinessEntity } from '@/types/api'

export async function getBusinessEntities(): Promise<BusinessEntity[]> {
  const { data } = await apiClient.get<{ data: BusinessEntity[] }>('/api/business-entities')
  return data.data
}
