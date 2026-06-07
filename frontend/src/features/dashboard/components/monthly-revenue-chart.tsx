import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '@/services/reports'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

export function MonthlyRevenueChart() {
  const { data } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats })

  const chartData = (data?.monthlyRevenue ?? []).map((item) => ({
    name: item.week,
    total: item.revenue,
  }))

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}tr`
            if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
            return value.toString()
          }}
        />
        <Bar
          dataKey='total'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
