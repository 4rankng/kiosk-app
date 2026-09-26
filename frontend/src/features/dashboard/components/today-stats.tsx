import { useQuery } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, AlertCircle, CheckCircle, Package, Wallet01 } from '@untitledui/icons'
import { getDashboardStats } from '@/services/reports'
import { formatCurrency, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/empty-state'

const statsConfig = [
  { key: 'revenue', icon: Wallet01, label: 'Doanh thu' },
  { key: 'orders', icon: Package, label: 'Đơn hàng' },
  { key: 'paid', icon: CheckCircle, label: 'Đã thanh toán' },
  { key: 'unpaid', icon: AlertCircle, label: 'Còn nợ' },
] as const

function TrendText({ value, suffix }: { value: number | string; suffix: string }) {
  const num = typeof value === 'string' ? parseFloat(value) : value
  const isUp = num > 0
  const isDown = num < 0
  const text = `${isUp ? '+' : ''}${value}${suffix}`
  if (!isUp && !isDown) {
    return (
      <p className='mt-1.5 text-xs font-medium text-tertiary'>— {text}</p>
    )
  }
  return (
    <p
      className={cn(
        'mt-1.5 flex items-center gap-0.5 text-xs font-medium',
        isUp ? 'text-success-primary' : 'text-error-primary',
      )}
    >
      {isUp ? <ArrowUp className='size-3 stroke-[3px]' /> : <ArrowDown className='size-3 stroke-[3px]' />}
      {text}
    </p>
  )
}

function StatCardSkeleton() {
  return (
    <div className='rounded-lg border border-primary bg-primary p-4'>
      <div className='flex items-center justify-between'>
        <div className='h-3 w-20 animate-pulse rounded bg-secondary' />
        <div className='size-4 animate-pulse rounded bg-secondary' />
      </div>
      <div className='mt-3 h-4 w-24 animate-pulse rounded bg-secondary' />
      <div className='mt-2 h-3 w-28 animate-pulse rounded bg-secondary' />
    </div>
  )
}

export function TodayStats() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats })

  if (isError) {
    return (
      <EmptyState
        variant='error'
        title='Không tải được thống kê'
        description='Đã có lỗi xảy ra khi tải dữ liệu today.'
        onRetry={() => refetch()}
      />
    )
  }

  if (isLoading) {
    return (
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {statsConfig.map((config) => (
          <StatCardSkeleton key={config.key} />
        ))}
      </div>
    )
  }

  const todayRevenue = data?.todayRevenue ?? 0
  const todayOrders = data?.todayOrders ?? 0
  const todayPaid = data?.todayPaid ?? 0
  const yesterdayRevenue = data?.yesterdayRevenue ?? 0
  const yesterdayOrders = data?.yesterdayOrders ?? 0

  // Trend calculations
  const revenueTrend = yesterdayRevenue > 0
    ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1)
    : null
  const orderTrend = yesterdayOrders > 0
    ? todayOrders - yesterdayOrders
    : null
  const collectionRate = todayRevenue > 0
    ? (todayPaid / todayRevenue * 100).toFixed(1)
    : null
  const debtorCount = data?.outstandingDebts?.length ?? 0

  const values: Record<string, string> = {
    revenue: formatCurrency(todayRevenue),
    orders: formatNumber(todayOrders),
    paid: formatCurrency(todayPaid),
    unpaid: formatCurrency(data?.todayUnpaid ?? 0),
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {statsConfig.map((config) => {
        const Icon = config.icon
        let subtitle: React.ReactNode = null

        if (config.key === 'revenue') {
          if (revenueTrend !== null) {
            subtitle = <TrendText value={revenueTrend} suffix='% vs hôm qua' />
          } else {
            subtitle = <TrendText value={0} suffix=' vs hôm qua' />
          }
        } else if (config.key === 'orders') {
          if (orderTrend !== null) {
            subtitle = <TrendText value={orderTrend} suffix=' vs hôm qua' />
          } else {
            subtitle = <TrendText value={0} suffix=' vs hôm qua' />
          }
        } else if (config.key === 'paid') {
          if (collectionRate !== null) {
            subtitle = <p className='mt-1.5 text-xs text-tertiary'>{collectionRate}% tỷ lệ thu</p>
          }
        } else if (config.key === 'unpaid') {
          subtitle = <p className='mt-1.5 text-xs text-tertiary'>{debtorCount} khách nợ</p>
        }

        return (
          <div key={config.key} className='rounded-lg border border-primary bg-primary p-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium text-tertiary'>{config.label}</span>
              <Icon className='size-4 text-fg-quaternary' />
            </div>
            <div className='mt-2 font-heading text-display-md font-semibold tabular-nums text-primary'>
              {values[config.key]}
            </div>
            {subtitle}
          </div>
        )
      })}
    </div>
  )
}
