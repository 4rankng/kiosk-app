import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { formatCurrency } from '@/lib/format'

interface MonthlyRevenueChartInnerProps {
  data: Array<{ name: string; total: number }>
}

// This module is loaded lazily so recharts stays out of the initial bundle.
export default function MonthlyRevenueChartInner({ data }: MonthlyRevenueChartInnerProps) {
  return (
    <BarChart data={data} accessibilityLayer>
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
  )
}
