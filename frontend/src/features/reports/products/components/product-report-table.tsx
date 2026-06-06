import React from 'react'
import { useState } from 'react'
import {
  type SortingState, flexRender, getCoreRowModel, getExpandedRowModel,
  getSortedRowModel, useReactTable, type ColumnDef,
} from '@tanstack/react-table'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronDown } from 'lucide-react'
import type { ProductReportRow } from '@/services/reports'

const columns: ColumnDef<ProductReportRow>[] = [
  { accessorKey: 'productCode', header: 'Mã hàng' },
  { accessorKey: 'productName', header: 'Tên mặt hàng' },
  { accessorKey: 'totalQuantity', header: 'SL đã bán' },
  { accessorKey: 'totalRevenue', header: 'Tổng Doanh Thu', cell: ({ getValue }) => formatCurrency(getValue() as number) },
]

export function ProductReportTable({ data }: { data: ProductReportRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data, columns, state: { sorting }, onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(), getRowCanExpand: () => true,
  })

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              <TableHead className='w-10' />
              {hg.headers.map((h) => (
                <TableHead key={h.id} className='whitespace-nowrap'>
                  {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <React.Fragment key={row.id}>
              <TableRow key={row.id} className='cursor-pointer' onClick={() => row.toggleExpanded()}>
                <TableCell>
                  <Button variant='ghost' size='icon' className='h-6 w-6'>
                    {row.getIsExpanded() ? <ChevronDown className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />}
                  </Button>
                </TableCell>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
              {row.getIsExpanded() && (
                <TableRow key={`${row.id}-detail`}>
                  <TableCell colSpan={row.getVisibleCells().length + 1} className='bg-muted/30 p-0'>
                    <DetailTable details={row.original.details} />
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
          {table.getRowModel().rows.length === 0 && (
            <TableRow><TableCell colSpan={5} className='h-24 text-center'>Không có dữ liệu.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function DetailTable({ details }: { details: ProductReportRow['details'] }) {
  return (
    <div className='mx-4 mb-2'>
      <p className='py-2 text-sm font-semibold'>🔍 Chi tiết lịch sử tiêu thụ</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã Hóa đơn</TableHead>
            <TableHead>Ngày giao dịch</TableHead>
            <TableHead>Tên Nhà Hàng Mua</TableHead>
            <TableHead>Số lượng</TableHead>
            <TableHead>Giá bán</TableHead>
            <TableHead>Thành tiền</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {details.map((d, i) => (
            <TableRow key={i}>
              <TableCell>{d.invoiceCode}</TableCell>
              <TableCell>{formatDateTime(d.date)}</TableCell>
              <TableCell>{d.customerName}</TableCell>
              <TableCell>{d.quantity}</TableCell>
              <TableCell>{formatCurrency(d.unitPrice)}</TableCell>
              <TableCell>{formatCurrency(d.total)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
