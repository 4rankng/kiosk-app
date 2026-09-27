import { lazy, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart01 } from '@untitledui/icons'
import { getDashboardStats, type DashboardStats } from '@/services/reports'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { EmptyState } from '@/components/empty-state'

// Lazy-load recharts to keep it out of the initial bundle.
const ChartInner = lazy(() => import('./monthly-revenue-chart-inner'))

const chartConfig = {
  total: {
    label: 'Doanh thu',
    color: 'var(--color-brand-500)',
  },
} satisfies ChartConfig

/**
 * Map the dashboard monthly-revenue series to recharts shape and decide
 * whether the month has any revenue to plot at all.
 */
export function buildRevenueChartData(
  monthlyRevenue: DashboardStats['monthlyRevenue'] | undefined
) {
  const chartData = (monthlyRevenue ?? []).map((item) => ({ name: item.week, total: item.revenue }))
  return {
    chartData,
    hasRevenue: chartData.some((item) => item.total > 0),
  }
}

function ChartEmptyState() {
  return (
    <div className='flex h-[250px] w-full items-center justify-center'>
      <EmptyState
        variant='empty'
        icon={<BarChart01 className='size-10 text-fg-quaternary' />}
        title='Chưa có doanh thu'
        description='Dữ liệu sẽ xuất hiện khi có đơn hàng trong tháng'
      />
    </div>
  )
}

export function MonthlyRevenueChart() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats })

  if (isError) {
    return (
      <div className='flex h-[250px] w-full items-center'>
        <EmptyState variant='error' className='w-full' onRetry={() => refetch()} description='Không tải được dữ liệu biểu đồ.' />
      </div>
    )
  }

  const { chartData, hasRevenue } = buildRevenueChartData(data?.monthlyRevenue)

  if (isLoading) {
    return <div className='h-[250px] w-full animate-pulse rounded bg-secondary' />
  }

  if (!hasRevenue) {
    return <ChartEmptyState />
  }

  return (
    <ChartContainer config={chartConfig} className='h-[250px] w-full'>
      <Suspense fallback={<div className='h-[250px] w-full animate-pulse rounded bg-secondary' />}>
        <ChartInner data={chartData} />
      </Suspense>
    </ChartContainer>
  )
}
