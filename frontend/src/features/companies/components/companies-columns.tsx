import { type ColumnDef } from '@tanstack/react-table'
import type { Company } from '@/types/company'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { useCompaniesContext } from './companies-provider'

export function getCompaniesColumns(): ColumnDef<Company>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Tên công ty/chuỗi' />,
    },
    {
      accessorKey: 'taxId',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Mã số thuế' />,
      cell: ({ row }) => row.getValue('taxId') || '—',
    },
    {
      accessorKey: 'priceListId',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Bảng giá' />,
      cell: ({ row }) => {
        const plId = row.getValue('priceListId') as string
        return plId ? <span className='text-muted-foreground'>Đã gán</span> : <span className='text-muted-foreground'>Chưa gán</span>
      },
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: function CompanyRowActions({ row }) {
        const { setOpen, setSelectedCompany } = useCompaniesContext()
        return (
          <div className='flex items-center gap-1'>
            <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => { setSelectedCompany(row.original); setOpen('edit') }}>
              <Pencil className='h-4 w-4' />
            </Button>
            <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => { setSelectedCompany(row.original); setOpen('delete') }}>
              <Trash2 className='h-4 w-4 text-destructive' />
            </Button>
          </div>
        )
      },
    },
  ]
}
