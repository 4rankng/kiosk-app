import { SearchMd, XClose } from '@untitledui/icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/base/buttons/button'
import { InputBase } from '@/components/base/input/input'
import { DataTableFacetedFilter } from './faceted-filter'
import { DataTableViewOptions } from './view-options'

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  searchPlaceholder?: string
  searchKey?: string
  filters?: {
    columnId: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }[]
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = 'Lọc...',
  searchKey,
  filters = [],
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || table.getState().globalFilter

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        {searchKey ? (
          <InputBase
            size='sm'
            icon={SearchMd}
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(searchKey)?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            wrapperClassName='w-37.5 lg:w-62.5'
          />
        ) : (
          <InputBase
            size='sm'
            icon={SearchMd}
            placeholder={searchPlaceholder}
            value={table.getState().globalFilter ?? ''}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            wrapperClassName='w-37.5 lg:w-62.5'
          />
        )}
        <div className='flex gap-x-2'>
          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId)
            if (!column) return null
            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
              />
            )
          })}
        </div>
        {isFiltered && (
          <Button
            color='tertiary'
            size='sm'
            iconTrailing={XClose}
            onPress={() => {
              table.resetColumnFilters()
              table.setGlobalFilter('')
            }}
          >
            Đặt lại
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
