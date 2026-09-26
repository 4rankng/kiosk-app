import { useState } from 'react'
import { formatCurrency, formatDateTime, formatNumber } from '@/lib/format'
import { MobileCard } from '@/components/data-table/mobile-card'
import type { ProductReportRow } from '@/services/reports'

export function ProductReportMobile({ data }: { data: ProductReportRow[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (data.length === 0) {
    return (
      <div className='flex h-24 items-center justify-center text-tertiary'>
        Không có dữ liệu.
      </div>
    )
  }

  return (
    <div className='space-y-2'>
      {data.map((product) => {
        const isExpanded = expandedId === product.productId

        return (
          <MobileCard
            key={product.productId}
            title={product.productName}
            status={
              <span className='rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-tertiary'>
                {product.productCode}
              </span>
            }
            metric={
              <span className='flex gap-3 tabular-nums'>
                <span>SL: {formatNumber(product.totalQuantity)}</span>
                <span className='font-semibold'>{formatCurrency(product.totalRevenue)}</span>
              </span>
            }
            expanded={isExpanded}
            onToggle={() => setExpandedId(isExpanded ? null : product.productId)}
          >
            <div className='space-y-1.5'>
              {product.details.map((d, i) => (
                <div
                  key={`${d.invoiceCode}-${i}`}
                  className='rounded-md bg-secondary px-3 py-2 text-sm'
                >
                  <div className='flex items-center justify-between'>
                    <span className='font-mono text-xs text-tertiary'>
                      {d.invoiceCode}
                    </span>
                    <span className='text-xs text-tertiary tabular-nums'>
                      {formatDateTime(d.date)}
                    </span>
                  </div>
                  <p className='mt-0.5 truncate font-medium text-primary'>{d.customerName}</p>
                  <div className='mt-1 flex items-center justify-between text-xs text-tertiary tabular-nums'>
                    <span>
                      {formatNumber(d.quantity)} x {formatCurrency(d.unitPrice)}
                    </span>
                    <span className='font-medium text-primary'>
                      {formatCurrency(d.total)}
                    </span>
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
