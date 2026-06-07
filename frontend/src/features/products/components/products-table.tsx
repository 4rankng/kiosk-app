import { useState, useMemo } from 'react'
import {
  type SortingState, type ColumnFiltersState, type VisibilityState, type RowSelectionState,
  flexRender, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues,
  getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable,
} from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { getProducts } from '@/services/products'
import { getCategories } from '@/services/categories'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTablePagination, DataTableFacetedFilter, DataTableViewOptions } from '@/components/data-table'
import { Input } from '@/components/ui/input'
import { useIsMobile } from '@/hooks/use-mobile'
import { getProductsColumns } from './products-columns'
import { ProductsMobileList } from './products-mobile-list'
import type { Product } from '@/types'

interface ProductsTableProps {
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductsTable({ onEdit, onDelete }: ProductsTableProps) {
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: getProducts })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ label: c.name, value: c.name })),
    [categories]
  )
  const columns = getProductsColumns(onEdit, onDelete)
  const isMobile = useIsMobile()

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

  const isFiltered = table.getState().columnFilters.length > 0

  // Mobile: client-side filter the raw products array for the compact list
  const searchValue = (table.getColumn('name')?.getFilterValue() as string) ?? ''
  const filteredProducts = useMemo(() => {
    if (!searchValue) return products
    const q = searchValue.toLowerCase()
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
    )
  }, [products, searchValue])

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <Input
          placeholder='Tìm mã hàng, tên sản phẩm...'
          value={searchValue}
          onChange={(e) => table.getColumn('name')?.setFilterValue(e.target.value)}
          className={isMobile ? 'h-9' : 'h-9 w-[280px]'}
        />
        {!isMobile && table.getColumn('category') && (
          <DataTableFacetedFilter column={table.getColumn('category')} title='Nhóm hàng' options={categoryOptions} />
        )}
        {isFiltered && (
          <button
            onClick={() => table.resetColumnFilters()}
            className='h-9 px-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
          >
            Xóa bộ lọc
          </button>
        )}
        {!isMobile && <DataTableViewOptions table={table} />}
      </div>
      {isMobile ? (
        <ProductsMobileList
          products={filteredProducts}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <>
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
          <DataTablePagination table={table} />
        </>
      )}
    </div>
  )
}
