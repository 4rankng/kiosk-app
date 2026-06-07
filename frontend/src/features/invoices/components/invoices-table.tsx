import { useState } from 'react'
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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableFacetedFilter, DataTableViewOptions } from '@/components/data-table'
import { Input } from '@/components/ui/input'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileCardView } from '@/components/data-table/mobile-card-view'
import { getInvoicesColumns } from './invoices-columns'
import { invoicesCardConfig } from './invoices-mobile-config'
import { statusOptions } from '../data/data'

export function InvoicesTable() {
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices,
  })
  const isMobile = useIsMobile()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const columns = getInvoicesColumns()

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

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <Input
          placeholder='Tìm mã hóa đơn, khách hàng...'
          value={(table.getColumn('customerName')?.getFilterValue() as string) ?? ''}
          onChange={(e) => table.getColumn('customerName')?.setFilterValue(e.target.value)}
          className={isMobile ? 'h-9 w-full' : 'h-9 w-[250px]'}
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

      {isMobile ? (
        <MobileCardView
          table={table}
          config={invoicesCardConfig}
          expandedId={expandedId}
          onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
        />
      ) : (
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className='whitespace-nowrap'>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className='h-24 text-center'>
                    Không có dữ liệu.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <DataTablePagination table={table} />
    </div>
  )
}
