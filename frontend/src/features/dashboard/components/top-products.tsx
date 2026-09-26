import { useQuery } from '@tanstack/react-query'
import { Package } from '@untitledui/icons'
import { getDashboardStats } from '@/services/reports'
import { formatNumber } from '@/lib/format'
import { EmptyState } from '@/components/empty-state'
import { WidgetCard } from './widget-card'

const TITLE = 'Sản phẩm bán chạy'
const DESCRIPTION = 'Tháng này'

function TopProductsSkeleton() {
  return (
    <WidgetCard title={TITLE} description={DESCRIPTION}>
      <ul className='space-y-3'>
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className='flex items-center justify-between gap-3'>
            <div className='min-w-0 flex-1'>
              <div className='mb-1 h-3 w-20 animate-pulse rounded bg-secondary' />
              <div className='h-2.5 w-full animate-pulse rounded-full bg-secondary' />
            </div>
            <div className='h-3 w-8 shrink-0 animate-pulse rounded bg-secondary' />
          </li>
        ))}
      </ul>
    </WidgetCard>
  )
}

export function TopProducts() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats })

  if (isLoading) return <TopProductsSkeleton />

  if (isError) {
    return (
      <WidgetCard title={TITLE} description={DESCRIPTION}>
        <EmptyState variant='error' onRetry={() => refetch()} description='Không tải được danh sách sản phẩm.' />
      </WidgetCard>
    )
  }

  const products = data?.topProducts ?? []

  if (products.length === 0) {
    return (
      <WidgetCard title={TITLE} description={DESCRIPTION}>
        <EmptyState
          variant='empty'
          icon={<Package className='size-10 text-fg-quaternary' />}
          title='Chưa có sản phẩm'
          description='Dữ liệu sẽ xuất hiện khi có đơn hàng'
        />
      </WidgetCard>
    )
  }

  const maxQty = Math.max(...products.map((p) => p.quantity))

  return (
    <WidgetCard title={TITLE} description={DESCRIPTION}>
      <ul className='space-y-3'>
        {products.map((p) => (
          <li key={p.name} className='flex items-center justify-between gap-3'>
            <div className='min-w-0 flex-1'>
              <div className='mb-1 text-xs text-tertiary'>{p.name}</div>
              <div className='h-2.5 w-full rounded-full bg-secondary'>
                <div
                  className='h-2.5 rounded-full bg-brand-solid'
                  style={{ width: `${(p.quantity / maxQty) * 100}%` }}
                />
              </div>
            </div>
            <div className='ps-2 text-xs font-medium text-primary tabular-nums'>
              {formatNumber(p.quantity)} {p.unit}
            </div>
          </li>
        ))}
      </ul>
    </WidgetCard>
  )
}
