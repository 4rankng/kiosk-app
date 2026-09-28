import { useQuery } from '@tanstack/react-query'
import { getCompanies } from '@/services/companies'
import { DataTable } from '@/components/data-table'
import { getCompaniesColumns } from './companies-columns'
import { companiesCardConfig } from './companies-mobile-config'

export function CompaniesTable() {
  const { data: companiesData, isLoading, isError, refetch } = useQuery({ queryKey: ['companies'], queryFn: () => getCompanies() })
  const companies = companiesData?.data ?? []

  return (
    <DataTable
      data={companies}
      columns={getCompaniesColumns()}
      mobileConfig={companiesCardConfig}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => refetch()}
      errorTitle='Không tải được danh sách công ty'
      loadingRows={6}
      showToolbar={false}
    />
  )
}
