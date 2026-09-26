import { type ColumnDef } from '@tanstack/react-table'
import { Pencil01, Trash01 } from '@untitledui/icons'
import type { Company } from '@/types/company'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { Button } from '@/components/base/buttons/button'
import { Badge } from '@/components/base/badges/badges'
import { useCompaniesContext } from './companies-provider'

export function getCompaniesColumns(): ColumnDef<Company>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Tên công ty/chuỗi' />,
    },
    {
      accessorKey: 'taxCode',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Mã số thuế' />,
      cell: ({ row }) => row.getValue('taxCode') || '—',
    },
    {
      accessorKey: 'priceListId',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Bảng giá' />,
      cell: ({ row }) => {
        const plId = row.getValue('priceListId') as string
        return plId
          ? <Badge type='color' color='brand' size='sm'>Đã gán</Badge>
          : <Badge type='color' color='gray' size='sm' className='text-tertiary'>Chưa gán</Badge>
      },
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: function CompanyRowActions({ row }) {
        const { setOpen, setSelectedCompany } = useCompaniesContext()
        return (
          <div className='flex items-center gap-1'>
            <Button color='tertiary' size='xs' iconLeading={Pencil01} aria-label='Chỉnh sửa công ty' onPress={() => { setSelectedCompany(row.original); setOpen('edit') }} />
            <Button color='tertiary-destructive' size='xs' iconLeading={Trash01} aria-label='Xóa công ty' onPress={() => { setSelectedCompany(row.original); setOpen('delete') }} />
          </div>
        )
      },
    },
  ]
}
