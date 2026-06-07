import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '@/services/reports'
import { formatCurrency } from '@/lib/format'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { HandCoins } from 'lucide-react'

function OutstandingDebtsSkeleton() {
  return (
    <>
      <CardHeader>
        <Skeleton className='h-5 w-24' />
        <Skeleton className='h-4 w-32' />
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex items-center gap-4'>
              <Skeleton className='h-8 w-8 shrink-0 rounded-full' />
              <Skeleton className='h-4 flex-1' />
              <Skeleton className='h-4 w-16' />
            </div>
          ))}
        </div>
      </CardContent>
    </>
  )
}

export function OutstandingDebts() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats })

  if (isLoading) return <OutstandingDebtsSkeleton />

  const debts = data?.outstandingDebts ?? []

  if (debts.length === 0) {
    return (
      <>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <HandCoins className='h-4 w-4' /> Công nợ
          </CardTitle>
          <CardDescription>Khách hàng còn nợ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground'>
            <HandCoins className='h-10 w-10' strokeWidth={1.5} />
            <p className='text-sm font-medium'>Không có công nợ</p>
            <p className='text-xs'>Tất cả hóa đơn đã thanh toán</p>
          </div>
        </CardContent>
      </>
    )
  }

  const totalDebt = debts.reduce((s, d) => s + d.amount, 0)

  return (
    <>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <HandCoins className='h-4 w-4' /> Công nợ
        </CardTitle>
        <CardDescription>Khách hàng còn nợ</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {debts.map((d, i) => (
            <div key={i} className='flex items-center gap-4'>
              <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold'>
                {i + 1}
              </span>
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-medium leading-none'>{d.customerName}</p>
              </div>
              <div className='font-medium tabular-nums'>{formatCurrency(d.amount)}</div>
            </div>
          ))}
        </div>
        <Separator className='my-4' />
        <div className='flex items-center justify-between'>
          <span className='text-sm text-muted-foreground'>Tổng công nợ</span>
          <span className='font-bold tabular-nums'>{formatCurrency(totalDebt)}</span>
        </div>
      </CardContent>
    </>
  )
}
