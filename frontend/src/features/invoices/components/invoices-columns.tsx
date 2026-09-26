import { type ColumnDef } from '@tanstack/react-table'
import type { Invoice } from '@/types'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { Button } from '@/components/base/buttons/button'
import { BadgeWithIcon } from '@/components/base/badges/badges'
import { Tooltip } from '@/components/base/tooltip/tooltip'
import { CoinsHand, Printer } from '@untitledui/icons'
import { useInvoicesContext } from './invoices-provider'
import { statusMeta } from '../status-meta'

export function getInvoicesColumns(): ColumnDef<Invoice, unknown>[] {
  return [
    {
      accessorKey: 'code',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Mã Hóa Đơn' />,
      cell: ({ row }) => (
        <span className='rounded bg-secondary px-1.5 py-0.5 font-mono text-sm font-medium text-secondary'>
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
        const total = Number(invoice.total || 0)
        const paidAmount = Number(invoice.paidAmount || 0)
        const isPaid = typeof invoice.isPaid === 'boolean' ? invoice.isPaid : (paidAmount >= total && total > 0)
        const partiallyPaid = !isPaid && paidAmount > 0 && paidAmount < total
        const meta = statusMeta(invoice.status, isPaid, partiallyPaid)
        return (
          <BadgeWithIcon type='pill-color' size='md' color={meta.badgeColor} iconLeading={meta.icon}>
            {meta.label}
          </BadgeWithIcon>
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
        const total = Number(invoice.total || 0)
        const paidAmount = Number(invoice.paidAmount || 0)
        const isPaid = typeof invoice.isPaid === 'boolean' ? invoice.isPaid : (paidAmount >= total && total > 0)
        return (
          <div className='flex items-center gap-1'>
            <Tooltip title='In hóa đơn'>
              <Button
                color='tertiary'
                size='xs'
                aria-label='In hóa đơn'
                iconLeading={Printer}
                onPress={() => {
                  setSelectedInvoice(row.original)
                  setOpen('print')
                }}
              />
            </Tooltip>
            {!isPaid && invoice.status !== 'cancelled' && (
              <Tooltip title='Thu tiền'>
                <Button
                  color='tertiary'
                  size='xs'
                  aria-label='Thu tiền'
                  iconLeading={CoinsHand}
                  onPress={() => {
                    setSelectedInvoice(row.original)
                    setOpen('payment')
                  }}
                />
              </Tooltip>
            )}
          </div>
        )
      },
    },
  ]
}
