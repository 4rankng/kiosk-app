import { useQuery } from '@tanstack/react-query'
import { Users01 } from '@untitledui/icons'
import { getDashboardStats } from '@/services/reports'
import { formatCurrency } from '@/lib/format'
import { EmptyState } from '@/components/empty-state'
import { WidgetCard } from './widget-card'

const TITLE = 'Khách hàng mua nhiều nhất'
const DESCRIPTION = 'Top 10 tháng này'

function TopCustomersSkeleton() {
  return (
    <WidgetCard title={TITLE} description={DESCRIPTION}>
      <div className='space-y-3'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='flex items-center gap-3'>
            <div className='size-7 shrink-0 animate-pulse rounded-full bg-secondary' />
            <div className='h-3 flex-1 animate-pulse rounded bg-secondary' />
            <div className='h-3 w-20 animate-pulse rounded bg-secondary' />
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}

export function TopCustomers() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats })

  if (isLoading) return <TopCustomersSkeleton />

  if (isError) {
    return (
      <WidgetCard title={TITLE} description={DESCRIPTION}>
        <EmptyState variant='error' onRetry={() => refetch()} description='Không tải được danh sách khách hàng.' />
      </WidgetCard>
    )
  }

  const customers = data?.topCustomers ?? []

  if (customers.length === 0) {
    return (
      <WidgetCard title={TITLE} description={DESCRIPTION}>
        <EmptyState
          variant='empty'
          icon={<Users01 className='size-10 text-fg-quaternary' />}
          title='Chưa có khách hàng'
          description='Dữ liệu sẽ xuất hiện khi có đơn hàng'
        />
      </WidgetCard>
    )
  }

  return (
    <WidgetCard title={TITLE} description={DESCRIPTION}>
      <div className='space-y-3'>
        {customers.map((c) => (
          <div key={c.name} className='flex items-center gap-3'>
            <span className='flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary'>
              {c.rank}
            </span>
            <p className='min-w-0 flex-1 truncate text-sm font-medium leading-none text-primary'>
              {c.name}
            </p>
            <span className='shrink-0 text-sm font-medium text-primary tabular-nums'>
              {formatCurrency(c.revenue)}
            </span>
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}
