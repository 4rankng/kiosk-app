import { useState, useMemo } from 'react'
import { type SortingState, type ColumnFiltersState, type VisibilityState, type RowSelectionState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { getCompanies } from '@/services/companies'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTablePagination } from '@/components/data-table'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileCardView } from '@/components/data-table/mobile-card-view'
import { getCompaniesColumns } from './companies-columns'
import { companiesCardConfig } from './companies-mobile-config'
import { EmptyState } from '@/components/empty-state'
import { getColumnAriaSort } from '@/components/data-table/aria-sort'

export function CompaniesTable() {
  const { data: companiesData, isLoading, isError, refetch } = useQuery({ queryKey: ['companies'], queryFn: () => getCompanies() })
  const companies = companiesData?.data ?? []
  const isMobile = useIsMobile()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const columns = useMemo(() => getCompaniesColumns(), [])

  const table = useReactTable({
    data: companies, columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting, onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility, onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(), getSortedRowModel: getSortedRowModel(),
  })

  if (isLoading) {
    return <EmptyState variant='loading' rows={6} />
  }
  if (isError) {
    return (
      <EmptyState
        variant='error'
        title='Không tải được danh sách công ty'
        description='Vui lòng kiểm tra kết nối và thử lại.'
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className='space-y-4'>
      {isMobile ? (
        <MobileCardView
          table={table}
          config={companiesCardConfig}
          expandedId={expandedId}
          infiniteScroll={true}
          onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
        />
      ) : (
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((h) => (
                    <TableHead key={h.id} className='whitespace-nowrap' aria-sort={getColumnAriaSort(h.column)}>
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={columns.length} className='h-24 text-center'>Không có dữ liệu.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {!isMobile && <DataTablePagination table={table} />}
    </div>
  )
}
