import { type ColumnDef } from '@tanstack/react-table'
import type { Invoice } from '@/types'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Printer, DollarSign } from 'lucide-react'
import { useInvoicesContext } from './invoices-provider'
import { statusMeta } from '../status-meta'

export function getInvoicesColumns(): ColumnDef<Invoice, unknown>[] {
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
      accessorKey: 'issuedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Thời gian' />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{formatDateTime(row.getValue('issuedAt'))}</span>,
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
        const invoice = row.original
        const meta = statusMeta(invoice.status, invoice.isPaid)
        const Icon = meta.icon
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${meta.className}`}>
                  <Icon className='h-3 w-3' />
                </span>
              </TooltipTrigger>
              <TooltipContent>{meta.label}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
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
                    aria-label='In hóa đơn'
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
                      aria-label='Thu tiền'
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
