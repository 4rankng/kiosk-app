import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '@/services/reports'
import { formatNumber } from '@/lib/format'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Package } from 'lucide-react'

function TopProductsSkeleton() {
  return (
    <>
      <CardHeader>
        <Skeleton className='h-5 w-36' />
        <Skeleton className='h-4 w-16' />
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex items-center justify-between gap-3'>
              <div className='min-w-0 flex-1'>
                <Skeleton className='mb-1 h-3 w-20' />
                <Skeleton className='h-2.5 w-full' />
              </div>
              <Skeleton className='h-4 w-8' />
            </div>
          ))}
        </div>
      </CardContent>
    </>
  )
}

export function TopProducts() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats })

  if (isLoading) return <TopProductsSkeleton />

  const products = data?.topProducts ?? []

  if (products.length === 0) {
    return (
      <>
        <CardHeader>
          <CardTitle>Sản phẩm bán chạy</CardTitle>
          <CardDescription>Tháng này</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground'>
            <Package className='h-10 w-10' strokeWidth={1.5} />
            <p className='text-sm font-medium'>Chưa có sản phẩm</p>
            <p className='text-xs'>Dữ liệu sẽ xuất hiện khi có đơn hàng</p>
          </div>
        </CardContent>
      </>
    )
  }

  const maxQty = Math.max(...products.map((p) => p.quantity))

  return (
    <>
      <CardHeader>
        <CardTitle>Sản phẩm bán chạy</CardTitle>
        <CardDescription>Tháng này</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className='space-y-3'>
          {products.map((p) => (
            <li key={p.rank} className='flex items-center justify-between gap-3'>
              <div className='min-w-0 flex-1'>
                <div className='mb-1 text-xs text-muted-foreground'>{p.name}</div>
                <div className='h-2.5 w-full rounded-full bg-muted'>
                  <div
                    className='h-2.5 rounded-full bg-primary'
                    style={{ width: `${(p.quantity / maxQty) * 100}%` }}
                  />
                </div>
              </div>
              <div className='ps-2 text-xs font-medium tabular-nums'>
                {formatNumber(p.quantity)} {p.unit}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </>
  )
}
