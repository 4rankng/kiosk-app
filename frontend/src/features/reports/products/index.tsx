import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { NotificationBell } from '@/components/notification-bell'
import { useQuery } from '@tanstack/react-query'
import { Package, TrendUp01, ShoppingBag02, File02 } from '@untitledui/icons'
import { getProductReport, type ProductReportRow } from '@/services/reports'
import { Button } from '@/components/base/buttons/button'
import { Label } from '@/components/base/input/label'
import { Breadcrumbs } from '@/components/application/breadcrumbs/breadcrumbs'
import { DateRangePicker } from '@/components/application/date-picker/date-range-picker'
import { parseDate } from '@internationalized/date'
import type { DateRange } from 'react-aria-components'
import { ProductReportTable } from './components/product-report-table'
import { EmptyState } from '@/components/empty-state'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { formatCurrency } from '@/lib/format'
import { ReportKpiCard } from '@/features/reports/components/report-kpi-card'


/** Roll the report rows up into the three summary KPI values. */
function summarizeProductReport(rows: ProductReportRow[]) {
  return rows.reduce(
    (acc, r) => ({
      revenue: acc.revenue + r.totalRevenue,
      quantity: acc.quantity + r.totalQuantity,
      products: acc.products + 1,
    }),
    { revenue: 0, quantity: 0, products: 0 },
  )
}

/** The three summary KPI cards above the report table. */
function ProductReportKpis({
  summary,
}: {
  summary: ReturnType<typeof summarizeProductReport>
}) {
  return (
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4'>
      <ReportKpiCard
        icon={Package}
        label='Số mặt hàng bán ra'
        value={summary.products}
        hint='mặt hàng phát sinh đơn'
      />
      <ReportKpiCard
        icon={ShoppingBag02}
        label='Tổng số lượng đã bán'
        value={summary.quantity.toLocaleString('vi-VN')}
        hint='sản phẩm / đơn vị'
      />
      <ReportKpiCard
        icon={TrendUp01}
        label='Tổng doanh thu'
        value={formatCurrency(summary.revenue)}
        hint='doanh thu tích lũy'
        labelClassName='text-primary'
        valueClassName='text-primary'
        iconClassName='text-fg-secondary'
      />
    </div>
  )
}

export function ProductReport() {
  useDocumentTitle('Báo cáo bán hàng theo sản phẩm')
  const today = new Date().toISOString().slice(0, 10)
  const firstOfMonth = today.slice(0, 7) + '-01'
  // DateRangePicker speaks react-aria DateValue; the report API takes plain
  // YYYY-MM-DD strings, so derive them rather than storing two copies.
  const [dateRange, setDateRange] = useState<DateRange>({
    start: parseDate(firstOfMonth),
    end: parseDate(today),
  })
  const startDate = dateRange.start?.toString() ?? firstOfMonth
  const endDate = dateRange.end?.toString() ?? today
  const [queryTrigger, setQueryTrigger] = useState(0)

  const { data: reportData = [], isLoading, refetch } = useQuery({
    queryKey: ['product-report', startDate, endDate, queryTrigger],
    queryFn: () => getProductReport(startDate, endDate),
  })

  const summary = useMemo(() => summarizeProductReport(reportData), [reportData])

  function handleFilter() {
    setQueryTrigger((t) => t + 1)
    refetch()
  }

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <NotificationBell />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-col gap-1'>
          <Breadcrumbs>
            <Breadcrumbs.Item>Báo cáo</Breadcrumbs.Item>
            <Breadcrumbs.Item>Hàng hóa</Breadcrumbs.Item>
          </Breadcrumbs>
          <PageHeader title='Báo cáo tổng hợp theo mặt hàng' description='Thống kê doanh thu và số lượng bán ra theo từng sản phẩm.' />
        </div>

        {/* Filters */}
        <div className='flex flex-wrap items-end gap-3'>
          <div className='flex w-full flex-col gap-1.5 sm:w-64'>
            <Label>Khoảng thời gian</Label>
            <DateRangePicker
              value={dateRange}
              onChange={(range) => {
                // The report query needs both bounds; ignore a half-picked range.
                if (range?.start && range.end) setDateRange({ start: range.start, end: range.end })
              }}
              onApply={handleFilter}
              aria-label='Khoảng thời gian báo cáo'
            />
          </div>
          <Button onPress={handleFilter} isDisabled={isLoading} isLoading={isLoading}>
            Lọc báo cáo
          </Button>
        </div>

        {/* Loading */}
        {isLoading && <EmptyState variant='loading' rows={6} />}

        {/* Empty */}
        {!isLoading && reportData.length === 0 && (
          <div className='rounded-lg border border-dashed border-primary bg-primary p-8'>
            <EmptyState
              variant='empty'
              icon={<File02 className='size-10 text-fg-quaternary' />}
              title='Không có dữ liệu mặt hàng'
              description='Không tìm thấy đơn hàng nào có sản phẩm bán ra trong khoảng thời gian đã chọn.'
            />
          </div>
        )}

        {/* Content with summary KPIs */}
        {!isLoading && reportData.length > 0 && (
          <div className='space-y-4'>
            <ProductReportKpis summary={summary} />

            <ProductReportTable data={reportData} />
          </div>
        )}
      </Main>
    </>
  )
}
