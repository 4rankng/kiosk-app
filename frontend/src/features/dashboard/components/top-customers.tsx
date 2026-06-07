import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '@/services/reports'
import { formatCurrency } from '@/lib/format'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy, Users } from 'lucide-react'

function TopCustomersSkeleton() {
  return (
    <>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Trophy className='h-4 w-4' /> Khách hàng mua nhiều nhất
        </CardTitle>
        <CardDescription>Top 10 tháng này</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex items-center gap-3'>
              <Skeleton className='h-7 w-7 shrink-0 rounded-full' />
              <Skeleton className='h-4 flex-1' />
              <Skeleton className='h-4 w-20' />
            </div>
          ))}
        </div>
      </CardContent>
    </>
  )
}

export function TopCustomers() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats })

  if (isLoading) return <TopCustomersSkeleton />

  const customers = data?.topCustomers ?? []

  if (customers.length === 0) {
    return (
      <>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Trophy className='h-4 w-4' /> Khách hàng mua nhiều nhất
          </CardTitle>
          <CardDescription>Top 10 tháng này</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground'>
            <Users className='h-10 w-10' strokeWidth={1.5} />
            <p className='text-sm font-medium'>Chưa có khách hàng</p>
            <p className='text-xs'>Dữ liệu sẽ xuất hiện khi có đơn hàng</p>
          </div>
        </CardContent>
      </>
    )
  }

  return (
    <>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Trophy className='h-4 w-4' /> Khách hàng mua nhiều nhất
        </CardTitle>
        <CardDescription>Top 10 tháng này</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {customers.map((c) => (
            <div key={c.rank} className='flex items-center gap-4'>
              <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold'>
                {c.rank}
              </span>
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-medium leading-none'>{c.name}</p>
              </div>
              <div className='font-medium tabular-nums'>
                {formatCurrency(c.revenue)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </>
  )
}
