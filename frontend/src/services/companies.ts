import type { Company } from '@/types/company'
import { companies } from '@/mock/companies'
import { sleep } from '@/lib/utils'

export async function getCompanies(): Promise<Company[]> {
  await sleep(300)
  return [...companies]
}

export async function getCompanyById(id: string): Promise<Company | undefined> {
  await sleep(200)
  return companies.find((c) => c.id === id)
}
