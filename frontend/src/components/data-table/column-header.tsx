import { ArrowDown, ArrowUp, ArrowsDown, EyeOff } from '@untitledui/icons'
import { type Column } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Button } from '@/components/base/buttons/button'
import { Dropdown } from '@/components/base/dropdown/dropdown'

type DataTableColumnHeaderProps<TData, TValue> =
  React.HTMLAttributes<HTMLDivElement> & {
    column: Column<TData, TValue>
    title: string
  }

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  const isSorted = column.getIsSorted()

  return (
    <div className={cn('flex items-center', className)}>
      <Dropdown.Root>
        <Button
          color='tertiary'
          size='sm'
          className='-ml-1.5'
          iconTrailing={isSorted === 'desc' ? ArrowDown : isSorted === 'asc' ? ArrowUp : ArrowsDown}
        >
          {title}
        </Button>
        <Dropdown.Popover placement='bottom start'>
          <Dropdown.Menu onAction={(key) => {
            if (key === 'asc') column.toggleSorting(false)
            if (key === 'desc') column.toggleSorting(true)
            if (key === 'hide') column.toggleVisibility(false)
          }}>
            <Dropdown.Item id='asc' icon={ArrowUp}>Tăng dần</Dropdown.Item>
            <Dropdown.Item id='desc' icon={ArrowDown}>Giảm dần</Dropdown.Item>
            {column.getCanHide() && (
              <>
                <Dropdown.Separator />
                <Dropdown.Item id='hide' icon={EyeOff}>Ẩn cột</Dropdown.Item>
              </>
            )}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown.Root>
    </div>
  )
}
