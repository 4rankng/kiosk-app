import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '@/services/reports'
import { formatCurrency } from '@/lib/format'
import { TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const formatCompact = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
  return value.toString()
}

export function MonthlyRevenueChart() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats })
  if (isLoading) return <div className='text-muted-foreground'>Đang tải...</div>

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Doanh thu theo tháng</CardTitle></CardHeader>
      <CardContent>
        <div className='h-[300px] w-full'>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={data?.monthlyRevenue ?? []}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='week' />
              <YAxis tickFormatter={formatCompact} width={60} />
              <Tooltip formatter={(value: unknown) => [formatCurrency(value as number), 'Doanh thu']} />
              <Bar dataKey='revenue' fill='hsl(var(--primary))' radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
