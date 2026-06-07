import { useMemo, useState } from 'react'
import { formatCurrency } from '@/lib/format'
import { MobileCard } from '@/components/data-table/mobile-card'
import type { CustomerReportRow } from '@/services/reports'

export function CustomerReportMobile({ data }: { data: CustomerReportRow[] }) {
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null)

  const grouped = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.companyName.localeCompare(b.companyName, 'vi'))
    const groups: Record<string, CustomerReportRow[]> = {}
    for (const row of sorted) {
      if (!groups[row.companyId]) groups[row.companyId] = []
      groups[row.companyId].push(row)
    }
    return groups
  }, [data])

  if (data.length === 0) {
    return (
      <div className='flex h-24 items-center justify-center text-muted-foreground'>
        Không có dữ liệu.
      </div>
    )
  }

  return (
    <div className='space-y-2'>
      {Object.entries(grouped).map(([companyId, rows]) => {
        const companyName = rows[0].companyName
        const totals = rows.reduce(
          (acc, r) => ({
            revenue: acc.revenue + r.totalRevenue,
            unpaid: acc.unpaid + r.unpaidAmount,
          }),
          { revenue: 0, unpaid: 0 }
        )
        const isExpanded = expandedCompanyId === companyId

        return (
          <MobileCard
            key={companyId}
            title={companyName}
            metric={
              <span className='flex gap-3'>
                <span>Doanh thu: {formatCurrency(totals.revenue)}</span>
                <span className='text-destructive'>Công nợ: {formatCurrency(totals.unpaid)}</span>
              </span>
            }
            expanded={isExpanded}
            onToggle={() => setExpandedCompanyId(isExpanded ? null : companyId)}
          >
            <div className='space-y-2'>
              {rows.map((row) => (
                <div
                  key={row.customerId}
                  className='flex items-center justify-between rounded-md bg-muted/40 px-3 py-2'
                >
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium'>{row.customerName}</p>
                    <p className='text-xs text-muted-foreground'>{row.customerCode}</p>
                  </div>
                  <div className='shrink-0 text-right'>
                    <p className='text-sm font-medium'>{formatCurrency(row.totalRevenue)}</p>
                    {row.unpaidAmount > 0 && (
                      <p className='text-xs text-destructive'>
                        Chưa thu: {formatCurrency(row.unpaidAmount)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </MobileCard>
        )
      })}
    </div>
  )
}
