/**
 * Units service — backward-compatible.
 */
import { apiClient } from '@/lib/api-client'

export interface Unit {
  id: string
  name: string
  abbreviation: string | null
  createdAt: string
}

export async function getUnits(): Promise<Unit[]> {
  const { data } = await apiClient.get<{ data: Unit[] }>('/api/units')
  return data.data
}

export async function createUnit(input: { name: string; abbreviation?: string }): Promise<Unit> {
  const { data } = await apiClient.post<{ data: Unit }>('/api/units', input)
  return data.data
}

export async function deleteUnit(id: string): Promise<void> {
  await apiClient.delete(`/api/units/${id}`)
}
