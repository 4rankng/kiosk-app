import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users01, CurrencyDollar, AlertCircle, File02 } from '@untitledui/icons'
import { getCustomerReport, type CustomerReportRow } from '@/services/reports'
import { getCompanies } from '@/services/companies'
import { Select } from '@/components/base/select/select'
import { SelectItem } from '@/components/base/select/select-item'
import { ReportScreen } from '@/components/report-screen'
import { useReportDateRange } from '@/components/use-report-date-range'
import { CustomerReportTable } from './components/customer-report-table'
import { ExportActions } from './components/export-actions'
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
    { revenue: 0, unpaid: 0, customers: 0 }
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
  const range = useReportDateRange()
  const [companyId, setCompanyId] = useState('all')

  const { data: companiesResult } = useQuery({ queryKey: ['companies'], queryFn: () => getCompanies() })
  const companies = companiesResult?.data ?? []

  const { data: reportData = [], isLoading, refetch } = useQuery({
    queryKey: ['customer-report', range.startDate, range.endDate, companyId, range.queryTrigger],
    queryFn: () => getCustomerReport(range.startDate, range.endDate, companyId === 'all' ? undefined : companyId),
  })

  const summary = useMemo(() => summarizeCustomerReport(reportData), [reportData])

  const activeCompanyName = companyId === 'all' ? 'tat-ca' : companies.find((c) => c.id === companyId)?.name ?? 'tat-ca'

  return (
    <ReportScreen
      crumbs={['Báo cáo', 'Khách hàng']}
      title='Báo cáo doanh thu & đối chiếu công nợ'
      description='Thống kê doanh thu và công nợ theo từng khách hàng và đối tác.'
      documentTitle='Báo cáo công nợ khách hàng'
      dateRange={range.dateRange}
      onDateRangeChange={range.onDateRangeChange}
      onApply={() => {
        range.applyFilter()
        refetch()
      }}
      isLoading={isLoading}
      isEmpty={reportData.length === 0}
      filters={
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
      }
      empty={{
        icon: <File02 className='size-10 text-quaternary' />,
        title: 'Không có dữ liệu phát sinh',
        description: 'Không tìm thấy đơn hàng hoặc hóa đơn trong khoảng thời gian đã chọn. Hãy thử nới rộng khoảng thời gian lọc.',
      }}
    >
      <CustomerReportKpis summary={summary} />

      <ExportActions data={reportData} companyName={activeCompanyName} />
      <CustomerReportTable data={reportData} />
    </ReportScreen>
  )
}
