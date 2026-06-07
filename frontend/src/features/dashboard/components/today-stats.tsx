import { useQuery } from '@tanstack/react-query'
import { Wallet, Package, CheckCircle, AlertCircle } from 'lucide-react'
import { getDashboardStats } from '@/services/reports'
import { formatCurrency, formatNumber } from '@/lib/format'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const statsConfig = [
  {
    key: 'revenue',
    icon: Wallet,
    label: 'Doanh thu',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    key: 'orders',
    icon: Package,
    label: 'Đơn hàng',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    key: 'paid',
    icon: CheckCircle,
    label: 'Đã TT',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    key: 'unpaid',
    icon: AlertCircle,
    label: 'Còn nợ',
    color: 'bg-rose-50 text-rose-600',
  },
] as const

function StatCardSkeleton() {
  return (
    <Card className='flex items-center gap-3 p-3'>
      <Skeleton className='h-9 w-9 shrink-0 rounded-lg' />
      <div className='min-w-0 flex-1'>
        <Skeleton className='h-3 w-16' />
        <Skeleton className='mt-1 h-5 w-20' />
      </div>
    </Card>
  )
}

export function TodayStats() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats })

  if (isLoading) {
    return (
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
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
    <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
      {statsConfig.map((config) => {
        const Icon = config.icon
        return (
          <Card key={config.key} className='flex items-center gap-3 p-3'>
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.color}`}>
              <Icon className='h-4 w-4' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-[11px] font-medium text-muted-foreground'>
                {config.label}
              </p>
              <p className='truncate text-base font-bold leading-tight tracking-tight'>
                {values[config.key]}
              </p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
