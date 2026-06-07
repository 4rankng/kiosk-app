import { useQuery } from '@tanstack/react-query'
import { Wallet, Package, CheckCircle, AlertCircle } from 'lucide-react'
import { getDashboardStats } from '@/services/reports'
import { formatCurrency, formatNumber } from '@/lib/format'
import { useIsMobile } from '@/hooks/use-mobile'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const statsConfig = [
  {
    key: 'revenue',
    icon: Wallet,
    label: 'Doanh thu',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    key: 'orders',
    icon: Package,
    label: 'Đơn hàng',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    key: 'paid',
    icon: CheckCircle,
    label: 'Đã thanh toán',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    key: 'unpaid',
    icon: AlertCircle,
    label: 'Chưa thanh toán',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
] as const

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className='p-4'>
        <Skeleton className='mb-2 h-3 w-20' />
        <Skeleton className='h-6 w-24' />
      </CardContent>
    </Card>
  )
}

export function TodayStats() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats })
  const isMobile = useIsMobile()

  if (isLoading) {
    return (
      <div className='grid gap-3 grid-cols-2 lg:grid-cols-4'>
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
    <div className='grid gap-3 grid-cols-2 lg:grid-cols-4'>
      {statsConfig.map((config) => {
        const Icon = config.icon
        return (
          <Card key={config.key} className='overflow-hidden'>
            <CardContent className={`p-3 sm:p-4 ${isMobile ? '' : ''}`}>
              {isMobile ? (
                /* Mobile: icon + label on top, value below — compact */
                <div>
                  <div className='flex items-center gap-1.5 mb-1.5'>
                    <div className={`rounded-md p-1 ${config.bg}`}>
                      <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                    </div>
                    <span className='text-xs text-muted-foreground truncate'>{config.label}</span>
                  </div>
                  <div className='text-lg font-bold truncate'>{values[config.key]}</div>
                </div>
              ) : (
                /* Desktop: icon right, label + value stacked left */
                <div className='flex items-center justify-between gap-3'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>{config.label}</p>
                    <div className='text-2xl font-bold'>{values[config.key]}</div>
                  </div>
                  <div className={`rounded-lg p-2.5 ${config.bg}`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
