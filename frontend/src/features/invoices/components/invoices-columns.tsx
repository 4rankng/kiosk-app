import { type ColumnDef } from '@tanstack/react-table'
import type { Invoice } from '@/types'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Printer, DollarSign } from 'lucide-react'
import { statusColorMap } from '../data/data'
import { useInvoicesContext } from './invoices-provider'

export function getInvoicesColumns(): ColumnDef<Invoice>[] {
  return [
    {
      accessorKey: 'code',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Mã Hóa Đơn' />,
      cell: ({ row }) => (
        <span className='bg-muted px-1.5 py-0.5 rounded font-mono text-sm font-medium'>
          {row.getValue('code')}
        </span>
      ),
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
      id: 'paymentStatus',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Thanh toán' />,
      cell: ({ row }) => {
        const invoice = row.original
        if (invoice.isPaid) {
          return (
            <Badge variant='outline'>
              Đã thanh toán
            </Badge>
          )
        }
        return (
          <Badge variant='outline' className='text-muted-foreground'>
            Chưa thanh toán
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: function InvoiceRowActions({ row }) {
        const { setOpen, setSelectedInvoice } = useInvoicesContext()
        const invoice = row.original
        return (
          <TooltipProvider>
            <div className='flex items-center gap-1'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    onClick={() => {
                      setSelectedInvoice(row.original)
                      setOpen('print')
                    }}
                  >
                    <Printer className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>In hóa đơn</TooltipContent>
              </Tooltip>
              {!invoice.isPaid && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
                      onClick={() => {
                        setSelectedInvoice(row.original)
                        setOpen('payment')
                      }}
                    >
                      <DollarSign className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Thu tiền</TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        )
      },
    },
  ]
}
