import { useQuery } from '@tanstack/react-query'
import { Wallet, Package, CheckCircle, AlertCircle } from 'lucide-react'
import { getDashboardStats } from '@/services/reports'
import { formatCurrency, formatNumber } from '@/lib/format'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const statsConfig = [
  { key: 'revenue', icon: Wallet, label: 'Doanh thu' },
  { key: 'orders', icon: Package, label: 'Đơn hàng' },
  { key: 'paid', icon: CheckCircle, label: 'Đã thanh toán' },
  { key: 'unpaid', icon: AlertCircle, label: 'Còn nợ' },
] as const

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <Skeleton className='h-4 w-20' />
        <Skeleton className='h-4 w-4' />
      </CardHeader>
      <CardContent>
        <Skeleton className='h-7 w-24' />
        <Skeleton className='mt-1 h-3 w-28' />
      </CardContent>
    </Card>
  )
}

export function TodayStats() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats })

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
            const num = parseFloat(revenueTrend)
            const isUp = num > 0
            subtitle = (
              <p className={`mt-1 text-xs ${isUp ? 'text-emerald-600' : num < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                {isUp ? '+' : ''}{revenueTrend}% vs hôm qua
              </p>
            )
          } else {
            subtitle = <p className='mt-1 text-xs text-muted-foreground'>— vs hôm qua</p>
          }
        } else if (config.key === 'orders') {
          if (orderTrend !== null) {
            const isUp = orderTrend > 0
            subtitle = (
              <p className={`mt-1 text-xs ${isUp ? 'text-emerald-600' : orderTrend < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                {isUp ? '+' : ''}{orderTrend} vs hôm qua
              </p>
            )
          } else {
            subtitle = <p className='mt-1 text-xs text-muted-foreground'>— vs hôm qua</p>
          }
        } else if (config.key === 'paid') {
          if (collectionRate !== null) {
            subtitle = <p className='mt-1 text-xs text-muted-foreground'>{collectionRate}% tỷ lệ thu</p>
          }
        } else if (config.key === 'unpaid') {
          subtitle = <p className='mt-1 text-xs text-muted-foreground'>{debtorCount} khách nợ</p>
        }

        return (
          <Card key={config.key}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {config.label}
              </CardTitle>
              <Icon className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{values[config.key]}</div>
              {subtitle}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
