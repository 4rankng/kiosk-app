import { useQuery } from '@tanstack/react-query'
import { CheckCircle, Clock, XCircle, CurrencyDollar } from '@untitledui/icons'
import { getInvoices } from '@/services/invoices'
import { DataTable } from '@/components/data-table'
import { getInvoicesColumns } from './invoices-columns'
import { invoicesCardConfig } from './invoices-mobile-config'
import { statusOptions } from '../data/data'

/** Colour key for the invoice status column, so the table cell colours are
 *  decodable without reading the column definition. */
function StatusLegend() {
  return (
    <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-tertiary'>
      <span className='flex items-center gap-1'><CheckCircle className='size-3 text-fg-success-primary' />Đã TT</span>
      <span className='flex items-center gap-1'><CurrencyDollar className='size-3 text-fg-error-primary' />Chưa TT</span>
      <span className='flex items-center gap-1'><Clock className='size-3 text-fg-warning-primary' />Đang xử lý</span>
      <span className='flex items-center gap-1'><XCircle className='size-3 text-quaternary' />Đã hủy</span>
    </div>
  )
}

export function InvoicesTable() {
  const { data: invoices = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices,
  })

  return (
    <DataTable
      data={invoices}
      columns={getInvoicesColumns()}
      mobileConfig={invoicesCardConfig}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => refetch()}
      errorTitle='Không tải được danh sách hóa đơn'
      search={{
        column: 'customerName',
        placeholder: 'Tìm mã hóa đơn, khách hàng...',
      }}
      facetedFilters={[{ column: 'status', title: 'Trạng thái', options: statusOptions }]}
      legend={<StatusLegend />}
    />
  )
}
