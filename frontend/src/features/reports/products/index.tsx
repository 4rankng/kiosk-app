import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Package, TrendUp01, ShoppingBag02, File02 } from '@untitledui/icons'
import { getProductReport, type ProductReportRow } from '@/services/reports'
import { ReportScreen } from '@/components/report-screen'
import { useReportDateRange } from '@/components/use-report-date-range'
import { ProductReportTable } from './components/product-report-table'
import { formatCurrency } from '@/lib/format'
import { ReportKpiGrid } from '@/features/reports/components/report-kpi-card'


/** Roll the report rows up into the three summary KPI values. */
function summarizeProductReport(rows: ProductReportRow[]) {
  return rows.reduce(
    (acc, r) => ({
      revenue: acc.revenue + r.totalRevenue,
      quantity: acc.quantity + r.totalQuantity,
      products: acc.products + 1,
    }),
    { revenue: 0, quantity: 0, products: 0 }
  )
}

export function ProductReport() {
  const range = useReportDateRange()

  const { data: reportData = [], isLoading, refetch } = useQuery({
    queryKey: ['product-report', range.startDate, range.endDate, range.queryTrigger],
    queryFn: () => getProductReport(range.startDate, range.endDate),
  })

  const summary = useMemo(() => summarizeProductReport(reportData), [reportData])

  return (
    <ReportScreen
      crumbs={['Báo cáo', 'Hàng hóa']}
      title='Báo cáo tổng hợp theo mặt hàng'
      description='Thống kê doanh thu và số lượng bán ra theo từng sản phẩm.'
      documentTitle='Báo cáo bán hàng theo sản phẩm'
      dateRange={range.dateRange}
      onDateRangeChange={range.onDateRangeChange}
      onApply={() => {
        range.applyFilter()
        refetch()
      }}
      isLoading={isLoading}
      isEmpty={reportData.length === 0}
      empty={{
        icon: <File02 className='size-10 text-quaternary' />,
        title: 'Không có dữ liệu mặt hàng',
        description: 'Không tìm thấy đơn hàng nào có sản phẩm bán ra trong khoảng thời gian đã chọn.',
      }}
    >
      <ReportKpiGrid
        kpis={[
          { icon: Package, label: 'Số mặt hàng bán ra', value: summary.products, hint: 'mặt hàng phát sinh đơn' },
          { icon: ShoppingBag02, label: 'Tổng số lượng đã bán', value: summary.quantity.toLocaleString('vi-VN'), hint: 'sản phẩm / đơn vị' },
          {
            icon: TrendUp01, label: 'Tổng doanh thu', value: formatCurrency(summary.revenue), hint: 'doanh thu tích lũy',
            labelClassName: 'text-primary', valueClassName: 'text-primary', iconClassName: 'text-fg-secondary',
          },
        ]}
      />
      <ProductReportTable data={reportData} />
    </ReportScreen>
  )
}
