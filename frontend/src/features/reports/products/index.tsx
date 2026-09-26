import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { NotificationBell } from '@/components/notification-bell'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { getProductReport } from '@/services/reports'
import { ProductReportTable } from './components/product-report-table'
import { EmptyState } from '@/components/empty-state'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { formatCurrency } from '@/lib/format'
import { Package, TrendingUp, ShoppingBag, FileText } from 'lucide-react'

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
      { revenue: 0, quantity: 0, products: 0 }
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
        <PageHeader title='Báo cáo tổng hợp theo mặt hàng' description='Thống kê doanh thu và số lượng bán ra theo từng sản phẩm.' />
        
        {/* Filters */}
        <div className='flex flex-wrap items-end gap-3'>
          <div className='space-y-1'>
            <Label className='text-sm font-medium'>Từ ngày</Label>
            <Input type='date' value={startDate} onChange={(e) => setStartDate(e.target.value)} className='h-9' />
          </div>
          <div className='space-y-1'>
            <Label className='text-sm font-medium'>Đến ngày</Label>
            <Input type='date' value={endDate} onChange={(e) => setEndDate(e.target.value)} className='h-9' />
          </div>
          <Button onClick={handleFilter} disabled={isLoading} className='h-9'>
            {isLoading ? 'Đang tải...' : 'Lọc báo cáo'}
          </Button>
        </div>

        {/* Loading */}
        {isLoading && <EmptyState variant='loading' rows={6} />}

        {/* Empty */}
        {!isLoading && reportData.length === 0 && (
          <div className='rounded-lg border border-dashed p-8 bg-card'>
            <EmptyState
              variant='empty'
              icon={<FileText className='h-10 w-10 text-muted-foreground/60' />}
              title='Không có dữ liệu mặt hàng'
              description='Không tìm thấy đơn hàng nào có sản phẩm bán ra trong khoảng thời gian đã chọn.'
            />
          </div>
        )}

        {/* Content with summary KPIs */}
        {!isLoading && reportData.length > 0 && (
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between pb-2'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>Số mặt hàng bán ra</CardTitle>
                  <Package className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-display font-bold tabular-nums'>{summary.products}</div>
                  <p className='text-xs text-muted-foreground'>mặt hàng phát sinh đơn</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between pb-2'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>Tổng số lượng đã bán</CardTitle>
                  <ShoppingBag className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-display font-bold tabular-nums'>{summary.quantity.toLocaleString('vi-VN')}</div>
                  <p className='text-xs text-muted-foreground'>sản phẩm / đơn vị</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between pb-2'>
                  <CardTitle className='text-sm font-medium text-success'>Tổng doanh thu</CardTitle>
                  <TrendingUp className='h-4 w-4 text-success' />
                </CardHeader>
                <CardContent>
                  <div className='text-display font-bold tabular-nums text-success'>{formatCurrency(summary.revenue)}</div>
                  <p className='text-xs text-muted-foreground'>doanh thu tích lũy</p>
                </CardContent>
              </Card>
            </div>

            <ProductReportTable data={reportData} />
          </div>
        )}
      </Main>
    </>
  )
}
