import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { I18nProvider, RouterProvider } from 'react-aria-components'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProductReport } from './index'

const m = vi.hoisted(() => ({
  getProductReport: vi.fn(),
}))

vi.mock('@/services/reports', () => ({
  getProductReport: m.getProductReport,
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

const rows = [
  {
    productId: 'p1',
    productCode: 'SP001',
    productName: 'Tôm sú',
    unit: 'kg',
    totalQuantity: 1250,
    totalRevenue: 156250000,
    details: [
      {
        invoiceCode: 'INV-2026-001',
        date: '2026-09-05T10:30:00.000Z',
        customerName: 'Nhà hàng Hoa Sứ',
        quantity: 2,
        unitPrice: 125000,
        total: 250000,
      },
    ],
  },
]

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    // DateRangePicker reads react-aria's router/i18n context; the page-level
    // tests render the page in isolation, so supply it explicitly.
    return (
      <I18nProvider>
        <RouterProvider navigate={() => {}} useHref={(href) => href}>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </RouterProvider>
      </I18nProvider>
    )
  }
}

async function renderProductReport() {
  return render(<ProductReport />, { wrapper: makeWrapper() })
}

describe('ProductReport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the empty state when there is no report data', async () => {
    m.getProductReport.mockResolvedValue([])
    const screen = await renderProductReport()

    await expect
      .element(screen.getByText('Không có dữ liệu mặt hàng'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('Số mặt hàng bán ra'))
      .not.toBeInTheDocument()
  })

  it('renders KPI summary and the product table with expandable details', async () => {
    m.getProductReport.mockResolvedValue(rows)
    const screen = await renderProductReport()

    await expect
      .element(screen.getByText('Số mặt hàng bán ra'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('1', { exact: true }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('1.250', { exact: true }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('156.250.000 đ').first())
      .toBeInTheDocument()

    // Table shows the product row
    await expect.element(screen.getByText('Tôm sú')).toBeInTheDocument()

    // Clicking the row expands the consumption history details
    await userEvent.click(screen.getByText('Tôm sú'))
    await expect
      .element(screen.getByText('Chi tiết lịch sử tiêu thụ'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('INV-2026-001'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('Nhà hàng Hoa Sứ'))
      .toBeInTheDocument()

    // Refetch passes the selected date range
    await vi.waitFor(() => expect(m.getProductReport).toHaveBeenCalledOnce())
    const [start, end] = m.getProductReport.mock.calls[0]
    expect(start).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(end).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
