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

export async function createCompany(data: Omit<Company, 'id'>): Promise<Company> {
  await sleep(300)
  const newCompany: Company = {
    ...data,
    id: `c${Date.now()}`,
  }
  companies.push(newCompany)
  return newCompany
}

export async function updateCompany(id: string, data: Partial<Company>): Promise<Company> {
  await sleep(300)
  const idx = companies.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error('Không tìm thấy công ty.')
  companies[idx] = { ...companies[idx], ...data }
  return companies[idx]
}

export async function deleteCompany(id: string): Promise<void> {
  await sleep(300)
  const idx = companies.findIndex((c) => c.id === id)
  if (idx !== -1) companies.splice(idx, 1)
}
