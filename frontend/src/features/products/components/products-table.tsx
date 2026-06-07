import { useState } from 'react'
import {
  type SortingState, type ColumnFiltersState, type VisibilityState, type RowSelectionState,
  flexRender, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues,
  getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable,
} from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { getProducts } from '@/services/products'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTablePagination, DataTableViewOptions } from '@/components/data-table'
import { Input } from '@/components/ui/input'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileCardView } from '@/components/data-table/mobile-card-view'
import { getProductsColumns } from './products-columns'
import { productsCardConfig } from './products-mobile-config'
import type { Product } from '@/types'

interface ProductsTableProps {
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductsTable({ onEdit, onDelete }: ProductsTableProps) {
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: getProducts })
  const columns = getProductsColumns(onEdit, onDelete)
  const isMobile = useIsMobile()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const table = useReactTable({
    data: products, columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting, onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility, onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(), getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(), getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <Input
          placeholder='Tìm mã hàng, tên sản phẩm...'
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(e) => table.getColumn('name')?.setFilterValue(e.target.value)}
          className={isMobile ? 'h-9 w-full' : 'h-9 w-[250px]'}
        />
        {!isMobile && <DataTableViewOptions table={table} />}
      </div>
      {isMobile ? (
        <MobileCardView
          table={table}
          config={productsCardConfig}
          expandedId={expandedId}
          onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
        />
      ) : (
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((h) => <TableHead key={h.id} className='whitespace-nowrap'>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={columns.length} className='h-24 text-center'>Không có dữ liệu.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      <DataTablePagination table={table} />
    </div>
  )
}
