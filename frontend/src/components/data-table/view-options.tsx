import { Sliders01 } from '@untitledui/icons'
import { type Table } from '@tanstack/react-table'
import type { Selection } from 'react-aria-components'
import { Button } from '@/components/base/buttons/button'
import { Dropdown } from '@/components/base/dropdown/dropdown'

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
  const columns = table
    .getAllColumns()
    .filter(
      (column) =>
        typeof column.accessorFn !== 'undefined' && column.getCanHide()
    )

  return (
    <Dropdown.Root>
      <Button
        color='secondary'
        size='sm'
        iconLeading={Sliders01}
        className='ms-auto hidden h-8 lg:flex'
      >
        Hiển thị
      </Button>
      <Dropdown.Popover placement='bottom end'>
        <Dropdown.Menu
          selectionMode='multiple'
          selectedKeys={new Set(columns.filter((c) => c.getIsVisible()).map((c) => c.id))}
          onSelectionChange={(keys: Selection) => {
            if (keys === 'all') return
            columns.forEach((column) => column.toggleVisibility(keys.has(column.id)))
          }}
        >
          <Dropdown.SectionHeader className='px-2 py-1.5 text-xs font-medium text-tertiary'>
            Bật/tắt cột
          </Dropdown.SectionHeader>
          {columns.map((column) => {
            const label = COLUMN_LABELS[column.id] || column.id
            return (
              <Dropdown.Item
                key={column.id}
                id={column.id}
                selectionIndicator='checkbox'
              >
                {label}
              </Dropdown.Item>
            )
          })}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown.Root>
  )
}
