import { describe, expect, it } from 'vitest'
import { buildRevenueChartData } from './monthly-revenue-chart'

describe('buildRevenueChartData', () => {
  it('maps week/revenue to name/total for the chart', () => {
    const { chartData, hasRevenue } = buildRevenueChartData([
      { week: 'Tuần 1', revenue: 2_000_000 },
      { week: 'Tuần 2', revenue: 3_500_000 },
    ])
    expect(chartData).toEqual([
      { name: 'Tuần 1', total: 2_000_000 },
      { name: 'Tuần 2', total: 3_500_000 },
    ])
    expect(hasRevenue).toBe(true)
  })

  it('reports no revenue when every week is zero', () => {
    const { hasRevenue } = buildRevenueChartData([
      { week: 'Tuần 1', revenue: 0 },
      { week: 'Tuần 2', revenue: 0 },
    ])
    expect(hasRevenue).toBe(false)
  })

  it('handles missing and empty series', () => {
    expect(buildRevenueChartData(undefined).chartData).toEqual([])
    expect(buildRevenueChartData(undefined).hasRevenue).toBe(false)
    expect(buildRevenueChartData([]).hasRevenue).toBe(false)
  })
})
