import { type ColumnDef } from '@tanstack/react-table'
import type { Customer } from '@/types'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { CompanyCell } from './company-cell'
import { CustomerActionsCell } from './customer-actions-cell'

export function getCustomersColumns(): ColumnDef<Customer>[] {
  return [
    { accessorKey: 'code', header: ({ column }) => <DataTableColumnHeader column={column} title='Mã KH' /> },
    { accessorKey: 'name', header: ({ column }) => <DataTableColumnHeader column={column} title='Khách hàng' /> },
    {
      accessorKey: 'companyId', header: 'Trực thuộc Công ty',
      cell: ({ row }) => <CompanyCell companyId={row.getValue('companyId') as string} />,
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      id: 'contact', header: 'Liên hệ / MST',
      cell: ({ row }) => (
        <div className='text-sm'>
          <div>{row.original.phone}</div>
          {row.original.taxId && <div className='text-muted-foreground'>MST: {row.original.taxId}</div>}
        </div>
      ),
    },
    { id: 'actions', header: 'Thao tác', cell: ({ row }) => <CustomerActionsCell customer={row.original} /> },
  ]
}
