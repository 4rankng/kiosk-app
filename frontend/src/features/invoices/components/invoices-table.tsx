import { useState, useMemo } from 'react'
import {
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { getInvoices } from '@/services/invoices'
import {
  DataTablePagination, DataTableFacetedFilter, DataTableViewOptions,
} from '@/components/data-table'
import { InputBase } from '@/components/base/input/input'
import { CheckCircle, Clock, XCircle, CurrencyDollar, SearchMd } from '@untitledui/icons'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileCardView } from '@/components/data-table/mobile-card-view'
import { EmptyState } from '@/components/empty-state'
import { getInvoicesColumns } from './invoices-columns'
import { invoicesCardConfig } from './invoices-mobile-config'
import { getColumnAriaSort } from '@/components/data-table/aria-sort'
import { statusOptions } from '../data/data'

export function InvoicesTable() {
  const { data: invoices = [], isLoading: isInvoicesLoading, isError: isInvoicesError, refetch: refetchInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices,
  })
  const isMobile = useIsMobile()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const columns = useMemo(() => getInvoicesColumns(), [])

  const table = useReactTable({
    data: invoices,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  if (isInvoicesLoading) {
    return <EmptyState variant='loading' rows={8} />
  }
  if (isInvoicesError) {
    return (
      <EmptyState
        variant='error'
        title='Không tải được danh sách hóa đơn'
        description='Vui lòng kiểm tra kết nối và thử lại.'
        onRetry={() => refetchInvoices()}
      />
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <InputBase
          size='sm'
          icon={SearchMd}
          placeholder='Tìm mã hóa đơn, khách hàng...'
          value={(table.getColumn('customerName')?.getFilterValue() as string) ?? ''}
          onChange={(e) => table.getColumn('customerName')?.setFilterValue(e.target.value)}
          wrapperClassName={isMobile ? 'w-full' : 'w-[250px]'}
        />
        {!isMobile && table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title='Trạng thái'
            options={statusOptions}
          />
        )}
        {!isMobile && <DataTableViewOptions table={table} />}
      </div>

      <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-tertiary'>
        <span className='flex items-center gap-1'><CheckCircle className='size-3 text-fg-success-primary' />Đã TT</span>
        <span className='flex items-center gap-1'><CurrencyDollar className='size-3 text-fg-error-primary' />Chưa TT</span>
        <span className='flex items-center gap-1'><Clock className='size-3 text-fg-warning-primary' />Đang xử lý</span>
        <span className='flex items-center gap-1'><XCircle className='size-3 text-fg-quaternary' />Đã hủy</span>
      </div>

      {isMobile ? (
        <MobileCardView
          table={table}
          config={invoicesCardConfig}
          expandedId={expandedId}
          infiniteScroll={true}
          onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
        />
      ) : (
        <div className='overflow-x-auto rounded-lg bg-primary ring-1 ring-secondary ring-inset'>
          <table className='w-full caption-bottom text-sm'>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className='border-b border-secondary bg-secondary'>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      scope='col'
                      className='h-9 px-3 text-start align-middle text-xs font-medium whitespace-nowrap text-tertiary'
                      aria-sort={getColumnAriaSort(header.column)}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className='border-b border-secondary transition-colors last:border-0 hover:bg-secondary/60'>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className='px-3 py-2 align-middle whitespace-nowrap text-primary'>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className='h-24 text-center text-tertiary'>
                    Không có dữ liệu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!isMobile && <DataTablePagination table={table} />}
    </div>
  )
}
