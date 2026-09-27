import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CustomerReport } from './index'

const m = vi.hoisted(() => ({
  getCustomerReport: vi.fn(),
  getCompanies: vi.fn(),
}))

vi.mock('@/services/reports', () => ({
  getCustomerReport: m.getCustomerReport,
}))

vi.mock('@/services/companies', () => ({
  getCompanies: m.getCompanies,
}))

// App chrome — not part of this page's contract
vi.mock('@/components/layout/header', () => ({
  Header: ({ children }: { children?: ReactNode }) => <header>{children}</header>,
}))
vi.mock('@/components/search', () => ({ Search: () => null }))
vi.mock('@/components/profile-dropdown', () => ({ ProfileDropdown: () => null }))
vi.mock('@/components/application/breadcrumbs/breadcrumbs', () => ({
  Breadcrumbs: Object.assign(
    ({ children }: { children?: ReactNode }) => <nav>{children}</nav>,
    { Item: ({ children }: { children?: ReactNode }) => <span>{children}</span> }
  ),
}))

const company = {
  id: 'co1',
  name: 'Công ty Hoa Sứ',
  taxCode: null,
  priceListId: null,
  address: null,
  phone: null,
  email: null,
}

const rows = [
  {
    customerId: 'cu1',
    customerCode: 'KH001',
    customerName: 'Nhà hàng Hoa Sứ',
    companyId: 'co1',
    companyName: 'Công ty Hoa Sứ',
    totalRevenue: 12500000,
    unpaidAmount: 3000000,
  },
  {
    customerId: 'cu2',
    customerCode: 'KH002',
    customerName: 'Quán Cô Ba',
    companyId: 'co1',
    companyName: 'Công ty Hoa Sứ',
    totalRevenue: 7500000,
    unpaidAmount: 2000000,
  },
]

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

async function renderCustomerReport() {
  return render(<CustomerReport />, { wrapper: makeWrapper() })
}

describe('CustomerReport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    m.getCompanies.mockResolvedValue({ data: [company], meta: { total: 1 } })
  })

  it('shows the loading state while the report query is in flight', async () => {
    m.getCustomerReport.mockReturnValue(new Promise(() => {}))
    const screen = await renderCustomerReport()

    // Filter button disabled while loading; no content or empty state yet
    await expect
      .element(screen.getByRole('button', { name: 'Lọc báo cáo' }))
      .toBeDisabled()
    await expect
      .element(screen.getByText('Không có dữ liệu phát sinh'))
      .not.toBeInTheDocument()
  })

  it('shows the empty state when there is no report data', async () => {
    m.getCustomerReport.mockResolvedValue([])
    const screen = await renderCustomerReport()

    await expect
      .element(screen.getByText('Không có dữ liệu phát sinh'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('Khách hàng giao dịch'))
      .not.toBeInTheDocument()
  })

  it('renders KPI summary and grouped totals for report rows', async () => {
    m.getCustomerReport.mockResolvedValue(rows)
    const screen = await renderCustomerReport()

    await expect.element(screen.getByText('Nhà hàng Hoa Sứ')).toBeInTheDocument()

    // KPI cards: customer count, revenue total, unpaid total
    await expect.element(screen.getByText('Khách hàng giao dịch')).toBeInTheDocument()
    await expect
      .element(screen.getByText('2', { exact: true }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('20.000.000 đ').first())
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('5.000.000 đ').first())
      .toBeInTheDocument()
    await expect
      .element(screen.getByText(/Tiền chưa thu \(Công nợ\)/))
      .toBeInTheDocument()

    // Table renders both customers plus the company group total row
    await expect.element(screen.getByText('Quán Cô Ba')).toBeInTheDocument()
    await expect
      .element(screen.getByText(/Tổng cộng công nợ Công ty Hoa Sứ:/))
      .toBeInTheDocument()

    // First fetch uses the default month-to-date range, all companies
    await vi.waitFor(() => expect(m.getCustomerReport).toHaveBeenCalledOnce())
    const [start, end, companyId] = m.getCustomerReport.mock.calls[0]
    expect(start).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(end).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(companyId).toBeUndefined()
  })

  it('refetches when the filter button is pressed', async () => {
    m.getCustomerReport.mockResolvedValue(rows)
    const screen = await renderCustomerReport()

    await expect.element(screen.getByText('Quán Cô Ba')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Lọc báo cáo' }))

    await vi.waitFor(() =>
      expect(m.getCustomerReport.mock.calls.length).toBeGreaterThanOrEqual(2)
    )
    expect(m.getCustomerReport.mock.calls[1]).toEqual(
      m.getCustomerReport.mock.calls[0]
    )
  })
})
