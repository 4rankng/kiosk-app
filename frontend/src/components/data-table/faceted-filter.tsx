import { PlusCircle } from '@untitledui/icons'
import { type Column } from '@tanstack/react-table'
import type { Selection } from 'react-aria-components'
import { Badge } from '@/components/base/badges/badges'
import { Button } from '@/components/base/buttons/button'
import { Dropdown } from '@/components/base/dropdown/dropdown'

type DataTableFacetedFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>
  title?: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues()
  const selectedValues = new Set(column?.getFilterValue() as string[] | undefined)

  return (
    <Dropdown.Root>
      <Button
        color='secondary'
        size='sm'
        iconLeading={PlusCircle}
      >
        {title}
        {selectedValues.size > 0 && (
          <>
            <span className='mx-1 h-4 w-px bg-border-secondary' />
            <Badge type='color' size='sm' color='gray'>{selectedValues.size}</Badge>
            <div className='hidden gap-1 lg:flex'>
              {selectedValues.size > 2 ? (
                <Badge type='color' size='sm' color='gray'>
                  {selectedValues.size} đã chọn
                </Badge>
              ) : (
                options
                  .filter((option) => selectedValues.has(option.value))
                  .map((option) => (
                    <Badge type='color' size='sm' color='gray' key={option.value}>
                      {option.label}
                    </Badge>
                  ))
              )}
            </div>
          </>
        )}
      </Button>
      <Dropdown.Popover placement='bottom start'>
        <Dropdown.Menu
          selectionMode='multiple'
          selectedKeys={selectedValues}
          onSelectionChange={(keys: Selection) => {
            if (keys === 'all') return
            const filterValues = options.filter((o) => keys.has(o.value)).map((o) => o.value)
            column?.setFilterValue(filterValues.length ? filterValues : undefined)
          }}
        >
          {options.length === 0 ? (
            <Dropdown.Item id='__none__' isDisabled>
              Không có kết quả
            </Dropdown.Item>
          ) : (
            options.map((option) => (
              <Dropdown.Item
                key={option.value}
                id={option.value}
                selectionIndicator='checkbox'
                addon={facets?.get(option.value) ? String(facets.get(option.value)) : undefined}
              >
                {option.label}
              </Dropdown.Item>
            ))
          )}
          {options.length > 0 && selectedValues.size > 0 && (
            <>
              <Dropdown.Separator />
              <Dropdown.Item id='__clear__' onAction={() => column?.setFilterValue(undefined)}>
                Xóa bộ lọc
              </Dropdown.Item>
            </>
          )}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown.Root>
  )
}
