import { type ColumnDef } from '@tanstack/react-table'
import type { Product } from '@/types'
import { formatCurrency } from '@/lib/format'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'

export function getProductsColumns(
  onEdit: (product: Product) => void,
  onDelete: (product: Product) => void
): ColumnDef<Product>[] {
  return [
    { accessorKey: 'code', header: ({ column }) => <DataTableColumnHeader column={column} title='Mã hàng' /> },
    { accessorKey: 'name', header: ({ column }) => <DataTableColumnHeader column={column} title='Tên mặt hàng' /> },
    { accessorKey: 'category', header: ({ column }) => <DataTableColumnHeader column={column} title='Nhóm' /> },
    { accessorKey: 'unit', header: ({ column }) => <DataTableColumnHeader column={column} title='ĐVT' /> },
    {
      accessorKey: 'purchasePrice',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Giá nhập' />,
      cell: ({ row }) => formatCurrency(row.getValue('purchasePrice')),
    },
    {
      accessorKey: 'defaultSalePrice',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Giá bán' />,
      cell: ({ row }) => formatCurrency(row.getValue('defaultSalePrice')),
    },
    {
      accessorKey: 'stock',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Tồn kho' />,
      cell: ({ row }) => {
        const stock = row.getValue('stock') as number
        return <span className={stock < 0 ? 'text-red-500 font-medium' : ''}>{stock}</span>
      },
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className='flex items-center gap-1'>
          <Button variant='ghost' size='icon' onClick={() => onEdit(row.original)}>
            <Pencil className='h-4 w-4' />
          </Button>
          <Button variant='ghost' size='icon' onClick={() => onDelete(row.original)}>
            <Trash2 className='h-4 w-4 text-destructive' />
          </Button>
        </div>
      ),
    },
  ]
}
