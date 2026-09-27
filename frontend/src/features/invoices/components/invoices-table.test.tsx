import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Invoice } from '@/types'
import { getInvoices } from '@/services/invoices'
import { InvoicesProvider } from './invoices-provider'
import { InvoicesTable } from './invoices-table'

vi.mock('@/services/invoices', () => ({ getInvoices: vi.fn() }))

const mockedGetInvoices = vi.mocked(getInvoices)

const baseInvoice: Invoice = {
  id: 'inv-1',
  code: 'HD0001',
  orderId: 'ord-1',
  customerId: 'cu-1',
  customerName: 'Quán Cô Ba',
  businessEntityId: 'be-1',
  status: 'completed',
  subtotal: 1250000,
  discount: 0,
  total: 1250000,
  paidAmount: 1250000,
  isPaid: true,
  issuedAt: '2026-09-26T09:30:00.000Z',
}

function never<T>(): Promise<T> {
  return new Promise(() => {})
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

async function renderTable() {
  const queryClient = makeQueryClient()
  return await render(
    <QueryClientProvider client={queryClient}>
      <InvoicesProvider>
        <InvoicesTable />
      </InvoicesProvider>
    </QueryClientProvider>
  )
}

describe('InvoicesTable', () => {
  it('shows skeleton rows while loading', async () => {
    mockedGetInvoices.mockReturnValue(never())
    const { container } = await renderTable()

    const pulses = container.querySelectorAll('.animate-pulse')
    expect(pulses.length).toBe(8)
  })

  it('shows error state with retry that reloads the list', async () => {
    mockedGetInvoices.mockRejectedValueOnce(new Error('boom'))
    mockedGetInvoices.mockResolvedValueOnce([baseInvoice])
    const screen = await renderTable()

    await expect
      .element(screen.getByText('Không tải được danh sách hóa đơn'))
      .toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Thử lại' }))
    await expect.element(screen.getByText('HD0001')).toBeInTheDocument()
  })

  it('renders the status legend and per-status badges for each invoice', async () => {
    mockedGetInvoices.mockResolvedValue([
      baseInvoice,
      { ...baseInvoice, id: 'inv-2', code: 'HD0002', status: 'pending', isPaid: false, paidAmount: 0 },
      { ...baseInvoice, id: 'inv-3', code: 'HD0003', status: 'cancelled', isPaid: false, paidAmount: 0 },
    ])
    const screen = await renderTable()

    await expect.element(screen.getByText('HD0001')).toBeInTheDocument()
    await expect.element(screen.getByText('HD0002')).toBeInTheDocument()
    await expect.element(screen.getByText('HD0003')).toBeInTheDocument()
    await expect.element(screen.getByText('Quán Cô Ba').first()).toBeInTheDocument()
    await expect.element(screen.getByText('1.250.000 đ').first()).toBeInTheDocument()
    const badges = screen.getByText('Đã TT')
    await expect.element(badges.first()).toBeInTheDocument()
    await expect.element(screen.getByText('Đang xử lý').first()).toBeInTheDocument()
    await expect.element(screen.getByText('Đã hủy').first()).toBeInTheDocument()
  })

  it('renders the empty-state cell when there are no invoices', async () => {
    mockedGetInvoices.mockResolvedValue([])
    const screen = await renderTable()

    await expect.element(screen.getByText('Không có dữ liệu.')).toBeInTheDocument()
  })

  it('filters rows by the invoice search input', async () => {
    mockedGetInvoices.mockResolvedValue([
      baseInvoice,
      { ...baseInvoice, id: 'inv-2', code: 'HD0002', customerName: 'Nhà hàng Hoa Sữa' },
    ])
    const screen = await renderTable()

    await expect.element(screen.getByText('HD0001')).toBeInTheDocument()
    await expect.element(screen.getByText('HD0002')).toBeInTheDocument()

    const search = screen.getByPlaceholder('Tìm mã hóa đơn, khách hàng...')
    await userEvent.fill(search, 'Cô Ba')
    await expect.element(screen.getByText('HD0001')).toBeInTheDocument()
    await expect.element(screen.getByText('HD0002')).not.toBeInTheDocument()
  })
})
