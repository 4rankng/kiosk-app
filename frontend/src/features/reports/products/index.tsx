import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { NotificationBell } from '@/components/notification-bell'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { getProductReport } from '@/services/reports'
import { ProductReportTable } from './components/product-report-table'

export function ProductReport() {
  const today = new Date().toISOString().slice(0, 10)
  const firstOfMonth = today.slice(0, 7) + '-01'
  const [startDate, setStartDate] = useState(firstOfMonth)
  const [endDate, setEndDate] = useState(today)
  const [fetchKey, setFetchKey] = useState(0)

  const { data: reportData = [], isLoading } = useQuery({
    queryKey: ['product-report', startDate, endDate, fetchKey],
    queryFn: () => getProductReport(startDate, endDate + 'T23:59:59'),
    enabled: fetchKey > 0,
  })

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <NotificationBell />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Báo cáo tổng hợp theo mặt hàng</h2>
          <p className='text-muted-foreground'>Thống kê doanh thu và số lượng bán ra theo sản phẩm.</p>
        </div>
        <div className='flex flex-wrap items-end gap-3'>
          <div className='space-y-1'>
            <label className='text-sm font-medium'>Từ ngày</label>
            <Input type='date' value={startDate} onChange={(e) => setStartDate(e.target.value)} className='h-9' />
          </div>
          <div className='space-y-1'>
            <label className='text-sm font-medium'>Đến ngày</label>
            <Input type='date' value={endDate} onChange={(e) => setEndDate(e.target.value)} className='h-9' />
          </div>
          <Button onClick={() => setFetchKey((k) => k + 1)} disabled={isLoading}>
            {isLoading ? 'Đang tải...' : 'Xem báo cáo'}
          </Button>
        </div>
        {fetchKey > 0 && <ProductReportTable data={reportData} />}
      </Main>
    </>
  )
}
