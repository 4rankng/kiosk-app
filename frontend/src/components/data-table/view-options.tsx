import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

type DataTableViewOptionsProps<TData> = {
  table: Table<TData>
}

const COLUMN_LABELS: Record<string, string> = {
  code: 'Mã',
  name: 'Tên',
  category: 'Nhóm hàng',
  categoryName: 'Nhóm hàng',
  unit: 'ĐVT',
  unitName: 'ĐVT',
  purchasePrice: 'Giá nhập',
  defaultSalePrice: 'Giá bán',
  issuedAt: 'Thời gian',
  customerName: 'Khách hàng',
  total: 'Tổng tiền',
  paidAmount: 'Đã thanh toán',
  status: 'Trạng thái',
  phone: 'Số điện thoại',
  address: 'Địa chỉ',
  company: 'Đơn vị',
  companyName: 'Đơn vị',
  taxId: 'Mã số thuế',
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='ms-auto hidden h-8 lg:flex'
        >
          <MixerHorizontalIcon className='size-4 mr-1.5' />
          Hiển thị
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-44'>
        <DropdownMenuLabel>Bật/tắt cột</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== 'undefined' && column.getCanHide()
          )
          .map((column) => {
            const label = COLUMN_LABELS[column.id] || column.id
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className='capitalize'
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {label}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
