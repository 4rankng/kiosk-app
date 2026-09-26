import { useState, useMemo } from 'react'
import {
  type SortingState, type ColumnFiltersState, type VisibilityState, type RowSelectionState,
  flexRender, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues,
  getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable,
} from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { SearchMd } from '@untitledui/icons'
import { getCustomers } from '@/services/customers'
import { getCompanies } from '@/services/companies'
import { DataTablePagination, DataTableFacetedFilter, DataTableViewOptions } from '@/components/data-table'
import { InputBase } from '@/components/base/input/input'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileCardView } from '@/components/data-table/mobile-card-view'
import { EmptyState } from '@/components/empty-state'
import { getCustomersColumns } from './customers-columns'
import { customersCardConfig } from './customers-mobile-config'
import { getColumnAriaSort } from '@/components/data-table/aria-sort'

export function CustomersTable() {
  const { data: customersData, isLoading: isCustomersLoading, isError: isCustomersError, refetch: refetchCustomers } = useQuery({ queryKey: ['customers'], queryFn: () => getCustomers() })
  const customers = customersData?.data ?? []
  const { data: companiesData } = useQuery({ queryKey: ['companies'], queryFn: () => getCompanies() })
  const companies = companiesData?.data ?? []
  const companyOptions = useMemo(
    () => companies.map((c: { id: string; name: string }) => ({ label: c.name, value: c.id })),
    [companies]
  )
  const columns = useMemo(() => getCustomersColumns(), [])
  const isMobile = useIsMobile()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const table = useReactTable({
    data: customers, columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting, onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility, onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(), getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(), getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  if (isCustomersLoading) {
    return <EmptyState variant='loading' rows={8} />
  }
  if (isCustomersError) {
    return (
      <EmptyState
        variant='error'
        title='Không tải được danh sách khách hàng'
        description='Vui lòng kiểm tra kết nối và thử lại.'
        onRetry={() => refetchCustomers()}
      />
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <InputBase
          aria-label='Tìm khách hàng'
          icon={SearchMd}
          size='sm'
          placeholder='Tìm tên nhà hàng, mã, số điện thoại...'
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(e) => table.getColumn('name')?.setFilterValue(e.target.value)}
          wrapperClassName={isMobile ? 'w-full' : 'w-[250px]'}
        />
        {!isMobile && table.getColumn('companyId') && (
          <DataTableFacetedFilter column={table.getColumn('companyId')} title='Công ty' options={companyOptions} />
        )}
        {!isMobile && <DataTableViewOptions table={table} />}
      </div>
      {isMobile ? (
        <MobileCardView
          table={table}
          config={customersCardConfig}
          expandedId={expandedId}
          onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
          infiniteScroll
        />
      ) : (
        <div className='w-full overflow-x-auto rounded-lg bg-primary shadow-xs ring-1 ring-secondary ring-inset'>
          <table className='w-full caption-bottom text-sm'>
            <thead className='border-b border-secondary [&_tr]:border-b [&_tr]:border-secondary'>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      scope='col'
                      aria-sort={getColumnAriaSort(h.column)}
                      className='h-9 px-2 text-start align-middle text-xs font-medium whitespace-nowrap text-tertiary'
                    >
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className='[&_tr:last-child]:border-0'>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className='border-b border-secondary transition-colors hover:bg-primary_hover'>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className='px-2 py-1.5 align-middle whitespace-nowrap text-secondary'>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className='h-24 text-center text-sm text-tertiary'>
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
