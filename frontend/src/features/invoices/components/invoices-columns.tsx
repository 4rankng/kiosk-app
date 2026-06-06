import { type ColumnDef } from '@tanstack/react-table'
import type { Invoice } from '@/types'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { statusColorMap } from '../data/data'
import { useInvoicesContext } from './invoices-provider'

export function getInvoicesColumns(): ColumnDef<Invoice>[] {
  return [
    {
      accessorKey: 'code',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Mã Hóa Đơn' />,
      cell: ({ row }) => <span className='font-mono font-medium'>{row.getValue('code')}</span>,
    },
    {
      accessorKey: 'date',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Thời gian' />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{formatDateTime(row.getValue('date'))}</span>,
    },
    {
      accessorKey: 'customerName',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Khách hàng' />,
    },
    {
      accessorKey: 'total',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Tổng tiền' />,
      cell: ({ row }) => <span className='tabular-nums font-medium'>{formatCurrency(row.getValue('total'))}</span>,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Trạng thái' />,
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const label = status === 'completed' ? 'Hoàn thành' : status === 'pending' ? 'Đang xử lý' : 'Đã hủy'
        return <Badge variant='outline' className={statusColorMap[status] ?? ''}>{label}</Badge>
      },
      filterFn: (row, _columnId, filterValue) => {
        if (Array.isArray(filterValue)) return filterValue.includes(row.getValue('status'))
        return row.getValue('status') === filterValue
      },
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: function InvoiceRowActions({ row }) {
        const { setOpen, setSelectedInvoice } = useInvoicesContext()
        return (
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setSelectedInvoice(row.original)
              setOpen('print')
            }}
          >
            <Printer className='mr-1 h-4 w-4' />
            In ấn
          </Button>
        )
      },
    },
  ]
}
