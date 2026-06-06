import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '@/services/reports'
import { formatCurrency } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

export function TopCustomers() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats })
  if (isLoading) return <div className='text-muted-foreground'>Đang tải...</div>

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-4 w-4" /> 10 khách hàng mua nhiều nhất tháng này</CardTitle></CardHeader>
      <CardContent>
        <div className='flex flex-col gap-2'>
          {(data?.topCustomers ?? []).map((c) => (
            <div key={c.rank} className='flex items-center justify-between rounded-lg border p-3'>
              <div className='flex items-center gap-3'>
                <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold'>
                  {c.rank}
                </span>
                <span className='font-medium'>{c.name}</span>
              </div>
              <span className='font-semibold'>{formatCurrency(c.revenue)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
