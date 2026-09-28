import { useQuery } from '@tanstack/react-query'
import { getCustomers } from '@/services/customers'
import { getCompanies } from '@/services/companies'
import { DataTable } from '@/components/data-table'
import { getCustomersColumns } from './customers-columns'
import { customersCardConfig } from './customers-mobile-config'

export function CustomersTable() {
  const { data: customersData, isLoading, isError, refetch } = useQuery({ queryKey: ['customers'], queryFn: () => getCustomers() })
  const customers = customersData?.data ?? []
  const { data: companiesData } = useQuery({ queryKey: ['companies'], queryFn: () => getCompanies() })
  const companyOptions = (companiesData?.data ?? []).map((c: { id: string; name: string }) => ({ label: c.name, value: c.id }))

  return (
    <DataTable
      data={customers}
      columns={getCustomersColumns()}
      mobileConfig={customersCardConfig}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => refetch()}
      errorTitle='Không tải được danh sách khách hàng'
      search={{
        column: 'name',
        placeholder: 'Tìm tên nhà hàng, mã, số điện thoại...',
        ariaLabel: 'Tìm khách hàng',
      }}
      facetedFilters={[{ column: 'companyId', title: 'Công ty', options: companyOptions }]}
    />
  )
}
