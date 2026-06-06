import { useQuery } from '@tanstack/react-query'
import { getCompanies } from '@/services/companies'

export function CompanyCell({ companyId }: { companyId: string }) {
  const { data: companies = [] } = useQuery({ queryKey: ['companies'], queryFn: getCompanies })
  const company = companies.find((c) => c.id === companyId)
  return <span>{company?.name ?? companyId}</span>
}
