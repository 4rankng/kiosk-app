import { useQuery } from '@tanstack/react-query'
import { CoinsHand } from '@untitledui/icons'
import { getDashboardStats } from '@/services/reports'
import { formatCurrency } from '@/lib/format'
import { EmptyState } from '@/components/empty-state'
import { WidgetCard } from './widget-card'

const TITLE = 'Công nợ'
const DESCRIPTION = 'Khách hàng còn nợ'

function OutstandingDebtsSkeleton() {
  return (
    <WidgetCard title={TITLE} description={DESCRIPTION}>
      <div className='space-y-4'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='flex items-center gap-3'>
            <div className='size-7 shrink-0 animate-pulse rounded-full bg-secondary' />
            <div className='h-3 flex-1 animate-pulse rounded bg-secondary' />
            <div className='h-3 w-16 animate-pulse rounded bg-secondary' />
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}

export function OutstandingDebts() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats })

  if (isLoading) return <OutstandingDebtsSkeleton />

  if (isError) {
    return (
      <WidgetCard title={TITLE} description={DESCRIPTION}>
        <EmptyState variant='error' onRetry={() => refetch()} description='Không tải được danh sách công nợ.' />
      </WidgetCard>
    )
  }

  const debts = data?.outstandingDebts ?? []

  if (debts.length === 0) {
    return (
      <WidgetCard title={TITLE} description={DESCRIPTION}>
        <EmptyState
          variant='empty'
          icon={<CoinsHand className='size-10 text-fg-quaternary' />}
          title='Không có công nợ'
          description='Tất cả hóa đơn đã thanh toán'
        />
      </WidgetCard>
    )
  }

  const totalDebt = debts.reduce((s, d) => s + d.amount, 0)

  return (
    <WidgetCard title={TITLE} description={DESCRIPTION}>
      <div className='space-y-3'>
        {debts.map((d, i) => (
          <div key={d.customerName} className='flex items-center gap-3'>
            <span className='flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary'>
              {i + 1}
            </span>
            <p className='min-w-0 flex-1 truncate text-sm font-medium leading-none text-primary'>
              {d.customerName}
            </p>
            <span className='shrink-0 text-sm font-medium text-warning-primary tabular-nums'>
              {formatCurrency(d.amount)}
            </span>
          </div>
        ))}
      </div>
      <div className='my-3 h-px w-full bg-border-secondary' />
      <div className='flex items-center justify-between rounded-md bg-secondary px-3 py-2'>
        <span className='text-sm font-medium text-primary'>Tổng công nợ</span>
        <span className='text-sm font-semibold text-warning-primary tabular-nums'>
          {formatCurrency(totalDebt)}
        </span>
      </div>
    </WidgetCard>
  )
}
