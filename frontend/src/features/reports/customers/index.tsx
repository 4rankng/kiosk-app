import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { getCustomerReport } from '@/services/reports'
import { getCompanies } from '@/services/companies'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CustomerReportTable } from './components/customer-report-table'
import { ExportActions } from './components/export-actions'

export function CustomerReport() {
  const today = new Date().toISOString().slice(0, 10)
  const firstOfMonth = today.slice(0, 7) + '-01'
  const [startDate, setStartDate] = useState(firstOfMonth)
  const [endDate, setEndDate] = useState(today)
  const [companyId, setCompanyId] = useState('all')
  const [fetchKey, setFetchKey] = useState(0)

  const { data: companies = [] } = useQuery({ queryKey: ['companies'], queryFn: getCompanies })

  const { data: reportData = [], isLoading } = useQuery({
    queryKey: ['customer-report', startDate, endDate, companyId, fetchKey],
    queryFn: () => getCustomerReport(startDate, endDate + 'T23:59:59', companyId === 'all' ? undefined : companyId),
    enabled: fetchKey > 0,
  })

  const activeCompanyName = companyId === 'all' ? 'tat-ca' : companies.find((c) => c.id === companyId)?.name ?? 'tat-ca'

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Báo cáo doanh thu để đối chiếu công nợ</h2>
          <p className='text-muted-foreground'>Thống kê doanh thu theo khách hàng và công ty.</p>
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
          <div className='space-y-1'>
            <label className='text-sm font-medium'>Công ty/Chuỗi</label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger className='h-9 w-[200px]'><SelectValue placeholder='Tất cả công ty' /></SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả công ty</SelectItem>
                {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setFetchKey((k) => k + 1)} disabled={isLoading}>
            {isLoading ? 'Đang tải...' : 'Xem báo cáo'}
          </Button>
        </div>
        {fetchKey > 0 && (
          <div className='space-y-4'>
            <ExportActions data={reportData} companyName={activeCompanyName} />
            <CustomerReportTable data={reportData} />
          </div>
        )}
      </Main>
    </>
  )
}
