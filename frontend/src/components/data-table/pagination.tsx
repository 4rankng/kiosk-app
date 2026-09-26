import { ChevronLeft, ChevronLeftDouble, ChevronRight, ChevronRightDouble } from '@untitledui/icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/base/buttons/button'
import { Select } from '@/components/base/select/select'
import { SelectItem } from '@/components/base/select/select-item'
import { cn, getPageNumbers } from '@/lib/utils'

type DataTablePaginationProps<TData> = {
  table: Table<TData>
  className?: string
}

export function DataTablePagination<TData>({
  table,
  className,
}: DataTablePaginationProps<TData>) {
  const currentPage = table.getState().pagination.pageIndex + 1
  const totalPages = table.getPageCount()
  const pageNumbers = getPageNumbers(currentPage, totalPages)

  return (
    <div
      className={cn(
        'flex items-center justify-between overflow-clip px-2',
        '@max-2xl/content:flex-col-reverse @max-2xl/content:gap-4',
        className
      )}
      style={{ overflowClipMargin: 1 }}
    >
      <div className='flex w-full items-center justify-between'>
        <div className='flex w-25 items-center justify-center text-sm font-medium @2xl/content:hidden'>
          Trang {currentPage}/{totalPages}
        </div>
        <div className='flex items-center gap-2 @max-2xl/content:flex-row-reverse'>
          <div className='w-17.5'>
            <Select
              aria-label='Số dòng mỗi trang'
              selectedKey={String(table.getState().pagination.pageSize)}
              onSelectionChange={(key) => table.setPageSize(Number(key))}
              size='sm'
              items={[10, 20, 30, 40, 50].map((n) => ({ id: String(n), label: String(n) }))}
            >
              {(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}
            </Select>
          </div>
          <p className='hidden text-sm font-medium sm:block'>Dòng mỗi trang</p>
        </div>
      </div>

      <div className='flex items-center sm:space-x-6 lg:space-x-8'>
        <div className='flex w-25 items-center justify-center text-sm font-medium @max-3xl/content:hidden'>
          Trang {currentPage}/{totalPages}
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            color='secondary'
            className='@max-md/content:hidden'
            iconLeading={ChevronLeftDouble}
            onPress={() => table.setPageIndex(0)}
            isDisabled={!table.getCanPreviousPage()}
          >
            <span className='sr-only'>Trang đầu</span>
          </Button>
          <Button
            color='secondary'
            iconLeading={ChevronLeft}
            onPress={() => table.previousPage()}
            isDisabled={!table.getCanPreviousPage()}
          >
            <span className='sr-only'>Trang trước</span>
          </Button>

          {/* Page number buttons */}
          {pageNumbers.map((pageNumber, index) => (
            <div key={`${pageNumber}-${index}`} className='flex items-center'>
              {pageNumber === '...' ? (
                <span className='px-1 text-sm text-tertiary'>...</span>
              ) : (
                <Button
                  color={currentPage === pageNumber ? 'primary' : 'secondary'}
                  className='min-w-8 px-2'
                  onPress={() => table.setPageIndex((pageNumber as number) - 1)}
                >
                  {pageNumber}
                </Button>
              )}
            </div>
          ))}

          <Button
            color='secondary'
            iconLeading={ChevronRight}
            onPress={() => table.nextPage()}
            isDisabled={!table.getCanNextPage()}
          >
            <span className='sr-only'>Trang sau</span>
          </Button>
          <Button
            color='secondary'
            className='@max-md/content:hidden'
            iconLeading={ChevronRightDouble}
            onPress={() => table.setPageIndex(table.getPageCount() - 1)}
            isDisabled={!table.getCanNextPage()}
          >
            <span className='sr-only'>Trang cuối</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
