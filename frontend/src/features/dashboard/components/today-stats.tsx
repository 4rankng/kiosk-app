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

  const values: Record<string, string> = {
    revenue: formatCurrency(data?.todayRevenue ?? 0),
    orders: formatNumber(data?.todayOrders ?? 0),
    paid: formatCurrency(data?.todayPaid ?? 0),
    unpaid: formatCurrency(data?.todayUnpaid ?? 0),
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {statsConfig.map((config) => {
        const Icon = config.icon
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
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
