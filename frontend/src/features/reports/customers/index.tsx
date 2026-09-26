import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { NotificationBell } from '@/components/notification-bell'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { getCustomerReport } from '@/services/reports'
import { getCompanies } from '@/services/companies'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomerReportTable } from './components/customer-report-table'
import { EmptyState } from '@/components/empty-state'
import { ExportActions } from './components/export-actions'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { formatCurrency } from '@/lib/format'
import { Users, DollarSign, AlertCircle, FileText } from 'lucide-react'

export function CustomerReport() {
  useDocumentTitle('Báo cáo công nợ khách hàng')
  const today = new Date().toISOString().slice(0, 10)
  const firstOfMonth = today.slice(0, 7) + '-01'
  const [startDate, setStartDate] = useState(firstOfMonth)
  const [endDate, setEndDate] = useState(today)
  const [companyId, setCompanyId] = useState('all')
  const [queryTrigger, setQueryTrigger] = useState(0)

  const { data: companiesResult } = useQuery({ queryKey: ['companies'], queryFn: () => getCompanies() })
  const companies = companiesResult?.data ?? []

  const { data: reportData = [], isLoading, refetch } = useQuery({
    queryKey: ['customer-report', startDate, endDate, companyId, queryTrigger],
    queryFn: () => getCustomerReport(startDate, endDate, companyId === 'all' ? undefined : companyId),
  })

  const summary = useMemo(() => {
    return reportData.reduce(
      (acc, r) => ({
        revenue: acc.revenue + r.totalRevenue,
        unpaid: acc.unpaid + r.unpaidAmount,
        customers: acc.customers + 1,
      }),
      { revenue: 0, unpaid: 0, customers: 0 }
    )
  }, [reportData])

  const activeCompanyName = companyId === 'all' ? 'tat-ca' : companies.find((c) => c.id === companyId)?.name ?? 'tat-ca'

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
        <PageHeader title='Báo cáo doanh thu & đối chiếu công nợ' description='Thống kê doanh thu và công nợ theo từng khách hàng và đối tác.' />
        
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
          <div className='space-y-1'>
            <Label className='text-sm font-medium'>Công ty/Chuỗi</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger className='h-9 w-full sm:w-[200px]'><SelectValue placeholder='Tất cả công ty' /></SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả công ty</SelectItem>
                {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleFilter} disabled={isLoading} className='h-9'>
            {isLoading ? 'Đang tải...' : 'Lọc báo cáo'}
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <EmptyState variant='loading' rows={6} />
        )}

        {/* Empty */}
        {!isLoading && reportData.length === 0 && (
          <div className='rounded-lg border border-dashed p-8 bg-card'>
            <EmptyState
              variant='empty'
              icon={<FileText className='h-10 w-10 text-muted-foreground/60' />}
              title='Không có dữ liệu phát sinh'
              description='Không tìm thấy đơn hàng hoặc hóa đơn trong khoảng thời gian đã chọn. Hãy thử nới rộng khoảng thời gian lọc.'
            />
          </div>
        )}

        {/* Content with summary KPIs */}
        {!isLoading && reportData.length > 0 && (
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between pb-2'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>Khách hàng giao dịch</CardTitle>
                  <Users className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-display font-bold tabular-nums'>{summary.customers}</div>
                  <p className='text-xs text-muted-foreground'>đối tác trong kỳ</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between pb-2'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>Tổng tiền hàng</CardTitle>
                  <DollarSign className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-display font-bold tabular-nums'>{formatCurrency(summary.revenue)}</div>
                  <p className='text-xs text-muted-foreground'>tổng doanh thu phát sinh</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between pb-2'>
                  <CardTitle className='text-sm font-medium text-warning'>Tiền chưa thu (Công nợ)</CardTitle>
                  <AlertCircle className='h-4 w-4 text-warning' />
                </CardHeader>
                <CardContent>
                  <div className='text-display font-bold tabular-nums text-warning'>{formatCurrency(summary.unpaid)}</div>
                  <p className='text-xs text-muted-foreground'>cần đối chiếu thu nợ</p>
                </CardContent>
              </Card>
            </div>

            <ExportActions data={reportData} companyName={activeCompanyName} />
            <CustomerReportTable data={reportData} />
          </div>
        )}
      </Main>
    </>
  )
}
