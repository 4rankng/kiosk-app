import { useState, type ReactNode } from 'react'
import {
  type ColumnDef,
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
import { SearchMd } from '@untitledui/icons'
import { InputBase } from '@/components/base/input/input'
import { EmptyState } from '@/components/empty-state'
import { useIsMobile } from '@/hooks/use-mobile'
import { getColumnAriaSort } from './aria-sort'
import { DataTableFacetedFilter } from './faceted-filter'
import { DataTablePagination } from './pagination'
import { DataTableViewOptions } from './view-options'
import { MobileCardView } from './mobile-card-view'
import type { MobileCardConfig } from './mobile-card-types'

/** A faceted filter bound to a column, rendered in the toolbar on desktop. */
export interface DataTableFacetedFilterConfig {
  column: string
  title: string
  options: { label: string; value: string }[]
}

/** Search box config. Omit entirely for tables that have no search input. */
export interface DataTableSearchConfig {
  /** Column id or accessorKey the search filters on. */
  column: string
  placeholder: string
  /** Accessible name. Defaults to the placeholder. */
  ariaLabel?: string
  /** Desktop width. Defaults to 250px, the width the app already used. */
  width?: string
}

export interface DataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  mobileConfig: MobileCardConfig
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  /** Error-state title, e.g. 'Không tải được danh sách khách hàng'. */
  errorTitle: string
  /** Loading skeleton rows. Defaults to 8. */
  loadingRows?: number
  search?: DataTableSearchConfig
  facetedFilters?: DataTableFacetedFilterConfig[]
  /** Whether the toolbar is rendered at all. Defaults to true when a search or filter is supplied. */
  showToolbar?: boolean
  /** Column-visibility dropdown. Defaults to true when a toolbar is rendered. */
  showViewOptions?: boolean
  /** Optional content between the toolbar and the table — e.g. a status legend. */
  legend?: ReactNode
}

/**
 * Shared shell for every TanStack Table list screen.
 *
 * Owns the four table state hooks, the loading/error branches, the toolbar
 * (search + faceted filters + view options), the mobile/desktop split, and
 * pagination. Callers own their query, their columns, and their mobile card
 * config.
 *
 * Visual contract — the dense table style this app standardised on:
 * `h-9` header cells at `px-2`, body cells at `px-2 py-1.5` in `text-secondary`,
 * a `border-secondary` header rule, `hover:bg-primary_hover` rows, and a
 * `shadow-xs ring-1 ring-inset` container. Keep this in sync with
 * `theme.css`: the 11/12px type contract and 30-36px controls.
 */
export function DataTable<TData>({
  data,
  columns,
  mobileConfig,
  isLoading,
  isError,
  onRetry,
  errorTitle,
  loadingRows = 8,
  search,
  facetedFilters,
  showToolbar,
  showViewOptions = true,
  legend,
}: DataTableProps<TData>) {
  const isMobile = useIsMobile()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const hasToolbar = showToolbar ?? Boolean(search || facetedFilters?.length)
  // Only register the faceted row models when a faceted filter is actually
  // configured — `getFacetedUniqueValues()` is wasted work otherwise.
  const hasFaceting = Boolean(facetedFilters?.length)

  const table = useReactTable<TData>({
    data,
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
    ...(hasFaceting
      ? { getFacetedRowModel: getFacetedRowModel(), getFacetedUniqueValues: getFacetedUniqueValues() }
      : {}),
  })

  if (isLoading) {
    return <EmptyState variant='loading' rows={loadingRows} />
  }

  if (isError) {
    return (
      <EmptyState
        variant='error'
        title={errorTitle}
        description='Vui lòng kiểm tra kết nối và thử lại.'
        onRetry={onRetry}
      />
    )
  }

  return (
    <div className='space-y-4'>
      {hasToolbar && (
        <div className='flex flex-wrap items-center gap-2'>
          {search && (
            <InputBase
              aria-label={search.ariaLabel ?? search.placeholder}
              icon={SearchMd}
              size='sm'
              placeholder={search.placeholder}
              value={(table.getColumn(search.column)?.getFilterValue() as string) ?? ''}
              onChange={(e) => table.getColumn(search.column)?.setFilterValue(e.target.value)}
              wrapperClassName={isMobile ? 'w-full' : (search.width ?? 'w-[250px]')}
            />
          )}
          {!isMobile &&
            facetedFilters?.map((filter) => {
              const column = table.getColumn(filter.column)
              if (!column) return null
              return (
                <DataTableFacetedFilter
                  key={filter.column}
                  column={column}
                  title={filter.title}
                  options={filter.options}
                />
              )
            })}
          {!isMobile && showViewOptions && <DataTableViewOptions table={table} />}
        </div>
      )}

      {legend}

      {isMobile ? (
        <MobileCardView
          table={table}
          config={mobileConfig}
          expandedId={expandedId}
          infiniteScroll
          onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
        />
      ) : (
        <div className='w-full overflow-x-auto rounded-lg bg-primary shadow-xs ring-1 ring-secondary ring-inset'>
          <table className='w-full caption-bottom text-sm'>
            <thead className='border-b border-secondary [&_tr]:border-b [&_tr]:border-secondary'>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      scope='col'
                      aria-sort={getColumnAriaSort(header.column)}
                      className='h-9 px-2 text-start align-middle text-xs font-medium whitespace-nowrap text-tertiary'
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
