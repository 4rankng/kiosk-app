import { useQuery } from '@tanstack/react-query'
import { AlertCircle, CheckCircle, Package, Wallet01 } from '@untitledui/icons'
import { getDashboardStats, type DashboardStats } from '@/services/reports'
import { formatCurrency, formatNumber } from '@/lib/format'
import { EmptyState } from '@/components/empty-state'
import { MetricChangeIndicator } from '@/components/application/metrics/metrics'

const statsConfig = [
  { key: 'revenue', icon: Wallet01, label: 'Doanh thu' },
  { key: 'orders', icon: Package, label: 'Đơn hàng' },
  { key: 'paid', icon: CheckCircle, label: 'Đã thanh toán' },
  { key: 'unpaid', icon: AlertCircle, label: 'Còn nợ' },
] as const

type StatKey = (typeof statsConfig)[number]['key']

export interface TodayStatsSummary {
  values: Record<StatKey, string>
  revenueTrend: string | null
  orderTrend: number | null
  collectionRate: string | null
  debtorCount: number
}

/** Derive display values and day-over-day trends from the dashboard stats. */
export function computeTodayStatsSummary(data: DashboardStats | undefined): TodayStatsSummary {
  const todayRevenue = data?.todayRevenue ?? 0
  const todayOrders = data?.todayOrders ?? 0
  const todayPaid = data?.todayPaid ?? 0
  const yesterdayRevenue = data?.yesterdayRevenue ?? 0
  const yesterdayOrders = data?.yesterdayOrders ?? 0

  return {
    values: {
      revenue: formatCurrency(todayRevenue),
      orders: formatNumber(todayOrders),
      paid: formatCurrency(todayPaid),
      unpaid: formatCurrency(data?.todayUnpaid ?? 0),
    },
    revenueTrend: yesterdayRevenue > 0
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1)
      : null,
    orderTrend: yesterdayOrders > 0
      ? todayOrders - yesterdayOrders
      : null,
    collectionRate: todayRevenue > 0
      ? (todayPaid / todayRevenue * 100).toFixed(1)
      : null,
    debtorCount: data?.outstandingDebts?.length ?? 0,
  }
}

function TrendText({ value, suffix }: { value: number | string; suffix: string }) {
  const num = typeof value === 'string' ? parseFloat(value) : value
  const text = `${num > 0 ? '+' : ''}${value}${suffix}`
  if (!Number.isFinite(num) || num === 0) {
    return (
      <p className='mt-1.5 text-xs font-medium text-tertiary'>— {text}</p>
    )
  }
  return (
    <MetricChangeIndicator
      type='modern'
      trend={num > 0 ? 'positive' : 'negative'}
      value={text}
      className='mt-1.5'
    />
  )
}

function statSubtitle(key: StatKey, summary: TodayStatsSummary): React.ReactNode {
  if (key === 'revenue') {
    if (summary.revenueTrend !== null) {
      return <TrendText value={summary.revenueTrend} suffix='% vs hôm qua' />
    }
    return <TrendText value={0} suffix=' vs hôm qua' />
  }
  if (key === 'orders') {
    if (summary.orderTrend !== null) {
      return <TrendText value={summary.orderTrend} suffix=' vs hôm qua' />
    }
    return <TrendText value={0} suffix=' vs hôm qua' />
  }
  if (key === 'paid') {
    if (summary.collectionRate !== null) {
      return <p className='mt-1.5 text-xs text-tertiary'>{summary.collectionRate}% tỷ lệ thu</p>
    }
    return null
  }
  return <p className='mt-1.5 text-xs text-tertiary'>{summary.debtorCount} khách nợ</p>
}

function StatCard({
  label,
  icon: Icon,
  value,
  subtitle,
}: {
  label: string
  icon: (typeof statsConfig)[number]['icon']
  value: string
  subtitle: React.ReactNode
}) {
  return (
    <div className='rounded-lg border border-primary bg-primary p-4'>
      <div className='flex items-center justify-between'>
        <span className='text-sm font-medium text-tertiary'>{label}</span>
        <Icon className='size-4 text-quaternary' />
      </div>
      <div className='mt-2 font-heading text-display-md font-semibold tabular-nums text-primary'>
        {value}
      </div>
      {subtitle}
    </div>
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

  const summary = computeTodayStatsSummary(data)

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {statsConfig.map((config) => (
        <StatCard
          key={config.key}
          label={config.label}
          icon={config.icon}
          value={summary.values[config.key]}
          subtitle={statSubtitle(config.key, summary)}
        />
      ))}
    </div>
  )
}
