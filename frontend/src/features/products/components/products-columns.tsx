import { type ColumnDef } from '@tanstack/react-table'
import { Pencil01, Trash01 } from '@untitledui/icons'
import type { Product } from '@/types'
import { formatCurrency } from '@/lib/format'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { Badge } from '@/components/base/badges/badges'
import { Dropdown } from '@/components/base/dropdown/dropdown'

export function getProductsColumns(
  onEdit: (product: Product) => void,
  onDelete: (product: Product) => void
): ColumnDef<Product>[] {
  return [
    {
      accessorKey: 'code',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Mã hàng' />,
      cell: ({ row }) => (
        <span className='font-mono text-sm'>{row.getValue('code')}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Tên mặt hàng' />,
      cell: ({ row }) => (
        <span className='font-medium'>{row.getValue('name')}</span>
      ),
    },
    {
      id: 'category',
      accessorKey: 'categoryName',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Nhóm hàng' />,
      cell: ({ row }) => {
        const val = row.original.categoryName || row.original.category
        return val ? (
          <Badge type='color' size='sm' color='gray'>
            {val}
          </Badge>
        ) : (
          <span className='text-tertiary'>—</span>
        )
      },
    },
    {
      id: 'unit',
      accessorKey: 'unitName',
      header: ({ column }) => <DataTableColumnHeader column={column} title='ĐVT' />,
      cell: ({ row }) => {
        const val = row.original.unitName || row.original.unit
        return (
          <span className='text-tertiary'>{val || '—'}</span>
        )
      },
    },
    {
      accessorKey: 'purchasePrice',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Giá nhập' />
      ),
      cell: ({ row }) => (
        <span className='tabular-nums text-tertiary'>
          {formatCurrency(row.getValue('purchasePrice'))}
        </span>
      ),
    },
    {
      accessorKey: 'defaultSalePrice',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Giá bán' />
      ),
      cell: ({ row }) => (
        <span className='font-medium tabular-nums'>
          {formatCurrency(row.getValue('defaultSalePrice'))}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className='sr-only'>Thao tác</span>,
      cell: ({ row }) => (
        <Dropdown.Root>
          <Dropdown.DotsButton className='size-8' />
          <Dropdown.Popover>
            <Dropdown.Menu
              onAction={(key) => {
                if (key === 'edit') onEdit(row.original)
                if (key === 'delete') onDelete(row.original)
              }}
            >
              <Dropdown.Item id='edit' icon={Pencil01}>
                Chỉnh sửa
              </Dropdown.Item>
              <Dropdown.Separator />
              <Dropdown.Item
                id='delete'
                icon={Trash01}
                className='[&_span]:text-error-primary [&_svg]:text-error-primary'
              >
                Xóa
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown.Root>
      ),
    },
  ]
}
