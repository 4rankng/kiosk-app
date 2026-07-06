import { lazy, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '@/services/reports'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/empty-state'

// Lazy-load recharts to keep it out of the initial bundle.
const ChartInner = lazy(() => import('./monthly-revenue-chart-inner'))

const chartConfig = {
  total: {
    label: 'Doanh thu',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

export function MonthlyRevenueChart() {
  const { data, isError, refetch } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats })

  if (isError) {
    return (
      <div className='flex h-[250px] w-full items-center'>
        <EmptyState variant='error' className='w-full' onRetry={() => refetch()} description='Không tải được dữ liệu biểu đồ.' />
      </div>
    )
  }

  const chartData = (data?.monthlyRevenue ?? []).map((item) => ({
    name: item.week,
    total: item.revenue,
  }))

  return (
    <ChartContainer config={chartConfig} className='h-[250px] w-full'>
      <Suspense
        fallback={<Skeleton className='h-[250px] w-full' />}
      >
        <ChartInner data={chartData} />
      </Suspense>
    </ChartContainer>
  )
}
