import { useQuery } from '@tanstack/react-query'
import { Wallet, Package, Clock } from 'lucide-react'
import { getDashboardStats } from '@/services/reports'
import { formatCurrency } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function TodayStats() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats })
  if (isLoading) return <div className='text-muted-foreground'>Đang tải...</div>

  return (
    <div className='grid gap-4 grid-cols-1 sm:grid-cols-3'>
      <Card>
        <CardHeader><CardTitle className='text-sm font-medium flex items-center'><Wallet className="mr-2 h-4 w-4" /> Doanh thu hôm nay</CardTitle></CardHeader>
        <CardContent><p className='text-2xl font-bold'>{formatCurrency(data?.todayRevenue ?? 0)}</p></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className='text-sm font-medium flex items-center'><Package className="mr-2 h-4 w-4" /> Số đơn hàng</CardTitle></CardHeader>
        <CardContent><p className='text-2xl font-bold'>{data?.todayOrders ?? 0} đơn</p></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className='text-sm font-medium flex items-center'><Clock className="mr-2 h-4 w-4" /> Đang xử lý</CardTitle></CardHeader>
        <CardContent><p className='text-2xl font-bold'>{data?.todayPending ?? 0} đơn</p></CardContent>
      </Card>
    </div>
  )
}
