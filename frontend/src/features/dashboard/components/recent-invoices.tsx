import { useQuery } from '@tanstack/react-query'
import { AlertCircle, CheckCircle, Clock, File02, XCircle } from '@untitledui/icons'
import { getDashboardStats, type DashboardStats } from '@/services/reports'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { BadgeWithIcon } from '@/components/base/badges/badges'
import { EmptyState } from '@/components/empty-state'
import { WidgetCard } from './widget-card'

const statusConfig = {
  cancelled: { icon: XCircle, label: 'Đã hủy', color: 'gray' },
  pending: { icon: Clock, label: 'Chờ TT', color: 'warning' },
  paid: { icon: CheckCircle, label: 'Đã TT', color: 'success' },
  unpaid: { icon: AlertCircle, label: 'Chưa TT', color: 'error' },
} as const

type StatusKey = keyof typeof statusConfig
type RecentInvoice = DashboardStats['recentInvoices'][number]

function StatusBadge({ status, isPaid }: { status: string; isPaid: boolean }) {
  const key: StatusKey = status === 'cancelled'
    ? 'cancelled'
    : status === 'pending'
      ? 'pending'
      : isPaid
        ? 'paid'
        : 'unpaid'
  const config = statusConfig[key]

  return (
    <BadgeWithIcon
      type='pill-color'
      size='sm'
      color={config.color}
      iconLeading={config.icon}
    >
      {config.label}
    </BadgeWithIcon>
  )
}

function formatInvoiceTime(date: string): string {
  return new Date(date).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function RecentInvoiceRow({ invoice }: { invoice: RecentInvoice }) {
  // Cancelled rows mute via text-quaternary (4.74:1 on white) rather than
  // opacity, which would push the text below the 4.5:1 WCAG floor.
  const isCancelled = invoice.status === 'cancelled'
  return (
    <div className='flex items-center gap-3 py-2.5 first:pt-0 last:pb-0'>
      <span className='shrink-0 font-mono text-xs text-tertiary tabular-nums'>
        {invoice.code}
      </span>
      <span
        className={cn(
          'min-w-0 flex-1 truncate text-sm',
          isCancelled ? 'text-quaternary' : 'text-primary'
        )}
      >
        {invoice.customerName}
      </span>
      <span
        className={cn(
          'shrink-0 text-sm font-medium tabular-nums',
          isCancelled ? 'text-quaternary' : 'text-primary'
        )}
      >
        {formatCurrency(invoice.total)}
      </span>
      <StatusBadge status={invoice.status} isPaid={invoice.isPaid} />
      <span className='shrink-0 text-xs text-tertiary tabular-nums'>
        {formatInvoiceTime(invoice.date)}
      </span>
    </div>
  )
}

function RecentInvoicesSkeleton() {
  return (
    <WidgetCard title='Hóa đơn gần đây'>
      <div className='space-y-3'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='flex items-center gap-3'>
            <div className='h-3 w-16 animate-pulse rounded bg-secondary' />
            <div className='h-3 flex-1 animate-pulse rounded bg-secondary' />
            <div className='h-3 w-20 animate-pulse rounded bg-secondary' />
            <div className='h-3 w-16 animate-pulse rounded bg-secondary' />
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}

export function RecentInvoices() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats })

  if (isLoading) return <RecentInvoicesSkeleton />

  if (isError) {
    return (
      <WidgetCard title='Hóa đơn gần đây'>
        <EmptyState variant='error' className='my-auto' onRetry={() => refetch()} description='Không tải được danh sách hóa đơn.' />
      </WidgetCard>
    )
  }

  const invoices = data?.recentInvoices ?? []

  if (invoices.length === 0) {
    return (
      <WidgetCard title='Hóa đơn gần đây'>
        <EmptyState variant='empty' className='my-auto' icon={<File02 className='size-10 text-quaternary' />} title='Chưa có hóa đơn' description='Dữ liệu sẽ xuất hiện khi có hóa đơn' />
      </WidgetCard>
    )
  }

  return (
    <WidgetCard title='Hóa đơn gần đây'>
      <div className='divide-y divide-primary'>
        {invoices.map((inv) => (
          <RecentInvoiceRow key={inv.code} invoice={inv} />
        ))}
      </div>
    </WidgetCard>
  )
}
