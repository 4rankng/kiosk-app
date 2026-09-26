import React, { useState } from 'react'
import {
  type SortingState, flexRender, getCoreRowModel, getExpandedRowModel,
  getSortedRowModel, useReactTable, type ColumnDef,
} from '@tanstack/react-table'
import { ChevronDown, ChevronRight, SearchMd } from '@untitledui/icons'
import { formatCurrency, formatDateTime, formatNumber } from '@/lib/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/features/reports/components/table'
import { Button } from '@/components/base/buttons/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { ProductReportMobile } from './product-report-mobile'
import type { ProductReportRow } from '@/services/reports'

const columns: ColumnDef<ProductReportRow>[] = [
  {
    accessorKey: 'productCode',
    header: 'Mã hàng',
    cell: ({ getValue }) => <span className='font-mono text-sm'>{getValue() as string}</span>,
  },
  {
    accessorKey: 'productName',
    header: 'Tên mặt hàng',
    cell: ({ getValue }) => <span className='font-medium'>{getValue() as string}</span>,
  },
  {
    accessorKey: 'totalQuantity',
    header: 'SL đã bán',
    cell: ({ getValue }) => <span className='tabular-nums'>{getValue() as number}</span>,
  },
  {
    accessorKey: 'totalRevenue',
    header: 'Tổng Doanh Thu',
    cell: ({ getValue }) => (
      <span className='tabular-nums font-medium text-success-primary'>{formatCurrency(getValue() as number)}</span>
    ),
  },
]

export function ProductReportTable({ data }: { data: ProductReportRow[] }) {
  const isMobile = useIsMobile()
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data, columns, state: { sorting }, onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(), getRowCanExpand: () => true,
  })

  if (isMobile) {
    return <ProductReportMobile data={data} />
  }

  return (
    <div className='rounded-lg border border-primary bg-primary'>
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
              <TableRow className='cursor-pointer' onClick={() => row.toggleExpanded()}>
                <TableCell className='w-10 p-2'>
                  <Button color='tertiary' size='xs' iconLeading={row.getIsExpanded() ? ChevronDown : ChevronRight} />
                </TableCell>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
              {row.getIsExpanded() && (
                <TableRow className='hover:bg-transparent'>
                  <TableCell colSpan={row.getVisibleCells().length + 1} className='bg-secondary p-0'>
                    <DetailTable details={row.original.details} />
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
          {table.getRowModel().rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className='h-24 text-center'>
                Không có dữ liệu.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function DetailTable({ details }: { details: ProductReportRow['details'] }) {
  return (
    <div className='mx-4 mb-2'>
      <p className='flex items-center gap-1.5 py-2 text-sm font-semibold'>
        <SearchMd className='size-4 text-fg-quaternary' />
        Chi tiết lịch sử tiêu thụ
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[130px]'>Mã Hóa đơn</TableHead>
            <TableHead className='w-[150px]'>Ngày giao dịch</TableHead>
            <TableHead>Tên Nhà Hàng Mua</TableHead>
            <TableHead className='w-[100px] text-right'>Số lượng</TableHead>
            <TableHead className='w-[120px] text-right'>Giá bán</TableHead>
            <TableHead className='w-[130px] text-right'>Thành tiền</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {details.map((d, i) => (
            <TableRow key={`${d.invoiceCode}-${i}`}>
              <TableCell className='font-mono text-sm'>{d.invoiceCode}</TableCell>
              <TableCell className='text-xs text-tertiary tabular-nums'>{formatDateTime(d.date)}</TableCell>
              <TableCell className='font-medium'>{d.customerName}</TableCell>
              <TableCell className='text-right tabular-nums'>{formatNumber(d.quantity)}</TableCell>
              <TableCell className='text-right text-tertiary tabular-nums'>{formatCurrency(d.unitPrice)}</TableCell>
              <TableCell className='text-right font-semibold tabular-nums'>{formatCurrency(d.total)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
