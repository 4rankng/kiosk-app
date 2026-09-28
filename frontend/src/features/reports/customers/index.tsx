import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { NotificationBell } from '@/components/notification-bell'
import { useQuery } from '@tanstack/react-query'
import { Users01, CurrencyDollar, AlertCircle, File02 } from '@untitledui/icons'
import { getCustomerReport, type CustomerReportRow } from '@/services/reports'
import { getCompanies } from '@/services/companies'
import { Button } from '@/components/base/buttons/button'
import { Label } from '@/components/base/input/label'
import { Select } from '@/components/base/select/select'
import { SelectItem } from '@/components/base/select/select-item'
import { Breadcrumbs } from '@/components/application/breadcrumbs/breadcrumbs'
import { DateRangePicker } from '@/components/application/date-picker/date-range-picker'
import { parseDate } from '@internationalized/date'
import type { DateRange } from 'react-aria-components'
import { CustomerReportTable } from './components/customer-report-table'
import { ExportActions } from './components/export-actions'
import { EmptyState } from '@/components/empty-state'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { formatCurrency } from '@/lib/format'
import { ReportKpiCard } from '@/features/reports/components/report-kpi-card'


/** Roll the report rows up into the three summary KPI values. */
function summarizeCustomerReport(rows: CustomerReportRow[]) {
  return rows.reduce(
    (acc, r) => ({
      revenue: acc.revenue + r.totalRevenue,
      unpaid: acc.unpaid + r.unpaidAmount,
      customers: acc.customers + 1,
    }),
    { revenue: 0, unpaid: 0, customers: 0 },
  )
}

/** The three summary KPI cards above the report table. */
function CustomerReportKpis({
  summary,
}: {
  summary: ReturnType<typeof summarizeCustomerReport>
}) {
  return (
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4'>
      <ReportKpiCard
        icon={Users01}
        label='Khách hàng giao dịch'
        value={summary.customers}
        hint='đối tác trong kỳ'
      />
      <ReportKpiCard
        icon={CurrencyDollar}
        label='Tổng tiền hàng'
        value={formatCurrency(summary.revenue)}
        hint='tổng doanh thu phát sinh'
      />
      <ReportKpiCard
        icon={AlertCircle}
        label='Tiền chưa thu (Công nợ)'
        value={formatCurrency(summary.unpaid)}
        hint='cần đối chiếu thu nợ'
        labelClassName='text-brand-tertiary'
        valueClassName='text-brand-tertiary'
        iconClassName='text-brand-tertiary'
      />
    </div>
  )
}

export function CustomerReport() {
  useDocumentTitle('Báo cáo công nợ khách hàng')
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
  const [companyId, setCompanyId] = useState('all')
  const [queryTrigger, setQueryTrigger] = useState(0)

  const { data: companiesResult } = useQuery({ queryKey: ['companies'], queryFn: () => getCompanies() })
  const companies = companiesResult?.data ?? []

  const { data: reportData = [], isLoading, refetch } = useQuery({
    queryKey: ['customer-report', startDate, endDate, companyId, queryTrigger],
    queryFn: () => getCustomerReport(startDate, endDate, companyId === 'all' ? undefined : companyId),
  })

  const summary = useMemo(() => summarizeCustomerReport(reportData), [reportData])

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
        <div className='flex flex-col gap-1'>
          <Breadcrumbs>
            <Breadcrumbs.Item>Báo cáo</Breadcrumbs.Item>
            <Breadcrumbs.Item>Khách hàng</Breadcrumbs.Item>
          </Breadcrumbs>
          <PageHeader title='Báo cáo doanh thu & đối chiếu công nợ' description='Thống kê doanh thu và công nợ theo từng khách hàng và đối tác.' />
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
          <div className='w-full sm:w-[200px]'>
            <Select
              label='Công ty/Chuỗi'
              placeholder='Tất cả công ty'
              selectedKey={companyId}
              onSelectionChange={(key) => setCompanyId(key === null ? 'all' : String(key))}
            >
              <SelectItem id='all'>Tất cả công ty</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} id={c.id}>{c.name}</SelectItem>
              ))}
            </Select>
          </div>
          <Button onPress={handleFilter} isDisabled={isLoading} isLoading={isLoading}>
            Lọc báo cáo
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <EmptyState variant='loading' rows={6} />
        )}

        {/* Empty */}
        {!isLoading && reportData.length === 0 && (
          <div className='rounded-lg border border-dashed border-primary bg-primary p-8'>
            <EmptyState
              variant='empty'
              icon={<File02 className='size-10 text-fg-quaternary' />}
              title='Không có dữ liệu phát sinh'
              description='Không tìm thấy đơn hàng hoặc hóa đơn trong khoảng thời gian đã chọn. Hãy thử nới rộng khoảng thời gian lọc.'
            />
          </div>
        )}

        {/* Content with summary KPIs */}
        {!isLoading && reportData.length > 0 && (
          <div className='space-y-4'>
            <CustomerReportKpis summary={summary} />

            <ExportActions data={reportData} companyName={activeCompanyName} />
            <CustomerReportTable data={reportData} />
          </div>
        )}
      </Main>
    </>
  )
}
