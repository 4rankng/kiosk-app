import { useMemo, Fragment } from 'react'
import { formatCurrency, toNumber } from '@/lib/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/features/reports/components/table'
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
    <div className='rounded-lg border border-primary bg-primary'>
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
            const totals = rows.reduce(
              (acc, r) => ({ revenue: acc.revenue + toNumber(r.totalRevenue), unpaid: acc.unpaid + toNumber(r.unpaidAmount) }),
              { revenue: 0, unpaid: 0 },
            )
            return (
              <Fragment key={companyId}>
                {rows.map((row) => (
                  <TableRow key={row.customerId}>
                    <TableCell className='font-mono text-sm'>{row.customerCode}</TableCell>
                    <TableCell className='font-medium'>{row.customerName}</TableCell>
                    <TableCell className='text-right tabular-nums'>{formatCurrency(row.totalRevenue)}</TableCell>
                    <TableCell className='text-right tabular-nums font-medium text-brand-tertiary'>
                      {formatCurrency(row.unpaidAmount)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className='bg-secondary font-bold hover:bg-secondary'>
                  <TableCell colSpan={2}>Tổng cộng công nợ {rows[0].companyName}:</TableCell>
                  <TableCell className='text-right font-bold tabular-nums'>{formatCurrency(totals.revenue)}</TableCell>
                  <TableCell className='text-right font-bold tabular-nums text-brand-tertiary'>
                    {formatCurrency(totals.unpaid)}
                  </TableCell>
                </TableRow>
              </Fragment>
            )
          })}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className='h-24 text-center'>
                Không có dữ liệu.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
