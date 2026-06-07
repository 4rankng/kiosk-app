import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '@/services/reports'
import { formatCurrency } from '@/lib/format'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, Clock, XCircle, AlertCircle, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

function RecentInvoicesSkeleton() {
  return (
    <>
      <CardHeader>
        <Skeleton className='h-5 w-36' />
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex items-center gap-3'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-4 flex-1' />
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-4 w-14' />
              <Skeleton className='h-4 w-10' />
            </div>
          ))}
        </div>
      </CardContent>
    </>
  )
}

function StatusBadge({ status, isPaid }: { status: string; isPaid: boolean }) {
  if (status === 'cancelled') {
    return (
      <span className='flex items-center gap-1 text-xs text-muted-foreground'>
        <XCircle className='h-3.5 w-3.5' /> Đã hủy
      </span>
    )
  }
  if (status === 'pending') {
    return (
      <span className='flex items-center gap-1 text-xs text-amber-600'>
        <Clock className='h-3.5 w-3.5' /> Chờ TT
      </span>
    )
  }
  // status === 'completed'
  if (isPaid) {
    return (
      <span className='flex items-center gap-1 text-xs text-emerald-600'>
        <CheckCircle className='h-3.5 w-3.5' /> Đã TT
      </span>
    )
  }
  return (
    <span className='flex items-center gap-1 text-xs text-red-600'>
      <AlertCircle className='h-3.5 w-3.5' /> Chưa TT
    </span>
  )
}

export function RecentInvoices() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats })

  if (isLoading) return <RecentInvoicesSkeleton />

  const invoices = data?.recentInvoices ?? []

  if (invoices.length === 0) {
    return (
      <>
        <CardHeader>
          <CardTitle>Hóa đơn gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground'>
            <FileText className='h-10 w-10' strokeWidth={1.5} />
            <p className='text-sm font-medium'>Chưa có hóa đơn</p>
            <p className='text-xs'>Dữ liệu sẽ xuất hiện khi có hóa đơn</p>
          </div>
        </CardContent>
      </>
    )
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Hóa đơn gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='divide-y'>
          {invoices.map((inv) => {
            const time = new Date(inv.date).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })
            return (
              <div
                key={inv.code}
                className={cn(
                  'flex items-center gap-3 py-2.5 first:pt-0 last:pb-0',
                  inv.status === 'cancelled' && 'opacity-50'
                )}
              >
                <span className='shrink-0 font-mono text-xs text-muted-foreground'>
                  {inv.code}
                </span>
                <span className='min-w-0 flex-1 truncate text-sm'>
                  {inv.customerName}
                </span>
                <span className='shrink-0 font-medium tabular-nums text-sm'>
                  {formatCurrency(inv.total)}
                </span>
                <StatusBadge status={inv.status} isPaid={inv.isPaid} />
                <span className='shrink-0 text-xs text-muted-foreground tabular-nums'>
                  {time}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </>
  )
}
