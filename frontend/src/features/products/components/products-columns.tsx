import { type ColumnDef } from '@tanstack/react-table'
import type { Product } from '@/types'
import { formatCurrency } from '@/lib/format'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

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
      accessorKey: 'category',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Nhóm hàng' />,
      cell: ({ row }) => (
        <Badge variant='secondary' className='font-normal'>
          {row.getValue('category')}
        </Badge>
      ),
    },
    {
      accessorKey: 'unit',
      header: ({ column }) => <DataTableColumnHeader column={column} title='ĐVT' />,
      cell: ({ row }) => (
        <span className='text-muted-foreground'>{row.getValue('unit')}</span>
      ),
    },
    {
      accessorKey: 'purchasePrice',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Giá nhập' />
      ),
      cell: ({ row }) => (
        <span className='tabular-nums text-muted-foreground'>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <MoreHorizontal className='h-4 w-4' />
              <span className='sr-only'>Mở menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-40'>
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Pencil className='mr-2 h-4 w-4' />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='text-destructive'
              onClick={() => onDelete(row.original)}
            >
              <Trash2 className='mr-2 h-4 w-4' />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
