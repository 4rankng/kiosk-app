import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '@/services/reports'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { formatCurrency } from '@/lib/format'

const chartConfig = {
  total: {
    label: 'Doanh thu',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

export function MonthlyRevenueChart() {
  const { data } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats })

  const chartData = (data?.monthlyRevenue ?? []).map((item) => ({
    name: item.week,
    total: item.revenue,
  }))

  return (
    <ChartContainer config={chartConfig} className='h-[350px] w-full'>
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey='name'
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickMargin={8}
          tickFormatter={(value: number) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}tr`
            if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
            return value.toString()
          }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value))}
            />
          }
        />
        <Bar
          dataKey='total'
          fill='var(--color-total)'
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  )
}
