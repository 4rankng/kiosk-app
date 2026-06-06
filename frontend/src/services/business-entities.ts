import type { BusinessEntity } from '@/types/business-entity'
import { businessEntities } from '@/mock/business-entities'
import { sleep } from '@/lib/utils'

export async function getBusinessEntities(): Promise<BusinessEntity[]> {
  await sleep(300)
  return businessEntities
}

export async function getBusinessEntityById(id: string): Promise<BusinessEntity | undefined> {
  await sleep(200)
  return businessEntities.find((e) => e.id === id)
}
