import { useMemo, Fragment } from 'react'
import { formatCurrency } from '@/lib/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useIsMobile } from '@/hooks/use-mobile'
import { CustomerReportMobile } from './customer-report-mobile'
import type { CustomerReportRow } from '@/services/reports'

export function CustomerReportTable({ data }: { data: CustomerReportRow[] }) {
  const isMobile = useIsMobile()

  const grouped = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.companyName.localeCompare(b.companyName, 'vi'))
    const groups: Record<string, CustomerReportRow[]> = {}
    for (const row of sorted) {
      if (!groups[row.companyId]) groups[row.companyId] = []
      groups[row.companyId].push(row)
    }
    return groups
  }, [data])

  if (isMobile) {
    return <CustomerReportMobile data={data} />
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã KH</TableHead>
            <TableHead>Tên Chi Nhánh Nhà Hàng</TableHead>
            <TableHead className='text-right'>Tổng Tiền Hàng</TableHead>
            <TableHead className='text-right'>Tiền Chưa Thu</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(grouped).map(([companyId, rows]) => {
            const totals = rows.reduce((acc, r) => ({ revenue: acc.revenue + r.totalRevenue, unpaid: acc.unpaid + r.unpaidAmount }), { revenue: 0, unpaid: 0 })
            return (
              <Fragment key={companyId}>
                {rows.map((row) => (
                  <TableRow key={row.customerId}>
                    <TableCell className='font-mono text-sm'>{row.customerCode}</TableCell>
                    <TableCell>{row.customerName}</TableCell>
                    <TableCell className='text-right'>{formatCurrency(row.totalRevenue)}</TableCell>
                    <TableCell className='text-right'>{formatCurrency(row.unpaidAmount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow key={`summary-${companyId}`} className='bg-muted/50 font-bold'>
                  <TableCell colSpan={2}>Tổng cộng công nợ của {rows[0].companyName}:</TableCell>
                  <TableCell className='text-right font-bold'>{formatCurrency(totals.revenue)}</TableCell>
                  <TableCell className='text-right font-bold'>{formatCurrency(totals.unpaid)}</TableCell>
                </TableRow>
              </Fragment>
            )
          })}
          {data.length === 0 && (
            <TableRow><TableCell colSpan={4} className='h-24 text-center'>Không có dữ liệu.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
