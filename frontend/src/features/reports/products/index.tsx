import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { NotificationBell } from '@/components/notification-bell'
import { useQuery } from '@tanstack/react-query'
import { Package, TrendUp01, ShoppingBag02, File02 } from '@untitledui/icons'
import { getProductReport } from '@/services/reports'
import { Button } from '@/components/base/buttons/button'
import { Label } from '@/components/base/input/label'
import { Breadcrumbs } from '@/components/application/breadcrumbs/breadcrumbs'
import { ProductReportTable } from './components/product-report-table'
import { EmptyState } from '@/components/empty-state'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { formatCurrency } from '@/lib/format'

const DATE_INPUT_CLASS = [
  'h-9 w-full rounded-lg bg-primary px-3 text-sm text-primary shadow-xs',
  'ring-1 ring-primary ring-inset outline-hidden transition duration-100 ease-linear',
  'placeholder:text-placeholder focus:ring-2 focus:ring-brand',
].join(' ')

export function ProductReport() {
  useDocumentTitle('Báo cáo bán hàng theo sản phẩm')
  const today = new Date().toISOString().slice(0, 10)
  const firstOfMonth = today.slice(0, 7) + '-01'
  const [startDate, setStartDate] = useState(firstOfMonth)
  const [endDate, setEndDate] = useState(today)
  const [queryTrigger, setQueryTrigger] = useState(0)

  const { data: reportData = [], isLoading, refetch } = useQuery({
    queryKey: ['product-report', startDate, endDate, queryTrigger],
    queryFn: () => getProductReport(startDate, endDate),
  })

  const summary = useMemo(() => {
    return reportData.reduce(
      (acc, r) => ({
        revenue: acc.revenue + r.totalRevenue,
        quantity: acc.quantity + r.totalQuantity,
        products: acc.products + 1,
      }),
      { revenue: 0, quantity: 0, products: 0 },
    )
  }, [reportData])

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
          <div className='flex w-full flex-col gap-1.5 sm:w-40'>
            <Label>Từ ngày</Label>
            <input
              type='date'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={DATE_INPUT_CLASS}
            />
          </div>
          <div className='flex w-full flex-col gap-1.5 sm:w-40'>
            <Label>Đến ngày</Label>
            <input
              type='date'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={DATE_INPUT_CLASS}
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
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4'>
              <div className='rounded-lg border border-primary bg-primary p-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-tertiary'>Số mặt hàng bán ra</span>
                  <Package className='size-4 text-fg-quaternary' />
                </div>
                <div className='mt-2 font-heading text-display-md font-semibold tabular-nums text-primary'>
                  {summary.products}
                </div>
                <p className='mt-1 text-xs text-tertiary'>mặt hàng phát sinh đơn</p>
              </div>

              <div className='rounded-lg border border-primary bg-primary p-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-tertiary'>Tổng số lượng đã bán</span>
                  <ShoppingBag02 className='size-4 text-fg-quaternary' />
                </div>
                <div className='mt-2 font-heading text-display-md font-semibold tabular-nums text-primary'>
                  {summary.quantity.toLocaleString('vi-VN')}
                </div>
                <p className='mt-1 text-xs text-tertiary'>sản phẩm / đơn vị</p>
              </div>

              <div className='rounded-lg border border-primary bg-primary p-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-success-primary'>Tổng doanh thu</span>
                  <TrendUp01 className='size-4 text-fg-success-secondary' />
                </div>
                <div className='mt-2 font-heading text-display-md font-semibold text-success-primary tabular-nums'>
                  {formatCurrency(summary.revenue)}
                </div>
                <p className='mt-1 text-xs text-tertiary'>doanh thu tích lũy</p>
              </div>
            </div>

            <ProductReportTable data={reportData} />
          </div>
        )}
      </Main>
    </>
  )
}
