import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Customer } from '@/types'
import type { PaginatedResponse } from '@/lib/api-client'
import { getCustomers } from '@/services/customers'
import { getCompanies } from '@/services/companies'
import { CustomersProvider } from './customers-provider'
import { CustomersTable } from './customers-table'

vi.mock('@/services/customers', () => ({ getCustomers: vi.fn() }))
vi.mock('@/services/companies', () => ({ getCompanies: vi.fn() }))

const mockedGetCustomers = vi.mocked(getCustomers)
const mockedGetCompanies = vi.mocked(getCompanies)

function page(data: Customer[]): PaginatedResponse<Customer> {
  return { data, meta: { page: 1, pageSize: 20, total: data.length, totalPages: 1 } }
}

function pageCompanies(data: { id: string; name: string }[]) {
  return {
    data: data.map((c) => ({ ...c, taxCode: null, priceListId: null, address: null, phone: null, email: null })),
    meta: { page: 1, pageSize: 20, total: data.length, totalPages: 1 },
  }
}

function never<T>(): Promise<T> {
  return new Promise(() => {})
}

const baseCustomer: Customer = {
  id: 'cu-1',
  code: 'KH001',
  name: 'Quán Cô Ba',
  companyId: 'co-1',
  companyName: 'Công ty A',
  priceListId: null,
  phone: '0901 234 567',
  email: 'coba@example.com',
  taxId: '0312345678',
  address: '12 Nguyễn Trãi, Q1',
  isActive: true,
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
      <CustomersProvider>
        <CustomersTable />
      </CustomersProvider>
    </QueryClientProvider>
  )
}

describe('CustomersTable', () => {
  it('shows skeleton rows while loading', async () => {
    mockedGetCustomers.mockReturnValue(never())
    mockedGetCompanies.mockReturnValue(never())
    const { container } = await renderTable()

    const pulses = container.querySelectorAll('.animate-pulse')
    expect(pulses.length).toBe(8)
  })

  it('shows error state with retry that reloads the list', async () => {
    mockedGetCustomers.mockRejectedValueOnce(new Error('boom'))
    mockedGetCustomers.mockResolvedValueOnce(page([baseCustomer]))
    mockedGetCompanies.mockResolvedValue(pageCompanies([]))
    const screen = await renderTable()

    await expect
      .element(screen.getByText('Không tải được danh sách khách hàng'))
      .toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Thử lại' }))
    await expect.element(screen.getByText('Quán Cô Ba')).toBeInTheDocument()
  })

  it('renders customer rows with code, name, phone and tax id', async () => {
    mockedGetCustomers.mockResolvedValue(page([baseCustomer]))
    mockedGetCompanies.mockResolvedValue(pageCompanies([{ id: "co-1", name: "Công ty A" }]))
    const screen = await renderTable()

    await expect.element(screen.getByText('Quán Cô Ba')).toBeInTheDocument()
    await expect.element(screen.getByText('KH001')).toBeInTheDocument()
    await expect.element(screen.getByText('0901 234 567')).toBeInTheDocument()
    await expect.element(screen.getByText('MST: 0312345678')).toBeInTheDocument()
    await expect
      .element(screen.getByRole('button', { name: 'Chỉnh sửa khách hàng' }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByRole('button', { name: 'Xóa khách hàng' }))
      .toBeInTheDocument()
  })

  it('renders the empty-state cell when there are no customers', async () => {
    mockedGetCustomers.mockResolvedValue(page([]))
    mockedGetCompanies.mockResolvedValue(pageCompanies([]))
    const screen = await renderTable()

    await expect.element(screen.getByText('Không có dữ liệu.')).toBeInTheDocument()
  })

  it('filters rows by the customer search input', async () => {
    mockedGetCustomers.mockResolvedValue(
      page([baseCustomer, { ...baseCustomer, id: 'cu-2', code: 'KH002', name: 'Nhà hàng Hoa Sữa' }])
    )
    mockedGetCompanies.mockResolvedValue(pageCompanies([]))
    const screen = await renderTable()

    await expect.element(screen.getByText('Quán Cô Ba')).toBeInTheDocument()
    await expect.element(screen.getByText('Nhà hàng Hoa Sữa')).toBeInTheDocument()

    const search = screen.getByPlaceholder('Tìm tên nhà hàng, mã, số điện thoại...')
    await userEvent.fill(search, 'Cô Ba')
    await expect.element(screen.getByText('Quán Cô Ba')).toBeInTheDocument()
    await expect
      .element(screen.getByText('Nhà hàng Hoa Sữa'))
      .not.toBeInTheDocument()
  })
})
