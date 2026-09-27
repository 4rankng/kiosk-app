import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Company } from '@/types/company'
import type { PaginatedResponse } from '@/lib/api-client'
import { getCompanies } from '@/services/companies'
import { CompaniesProvider } from './companies-provider'
import { CompaniesTable } from './companies-table'

vi.mock('@/services/companies', () => ({ getCompanies: vi.fn() }))

const mockedGetCompanies = vi.mocked(getCompanies)

const baseCompany: Company = {
  id: 'co-1',
  name: 'Công ty A',
  taxCode: '0123456789',
  priceListId: 'pl-1',
  address: null,
  phone: null,
  email: null,
}

function page(data: Company[]): PaginatedResponse<Company> {
  return { data, meta: { page: 1, pageSize: 20, total: data.length, totalPages: 1 } }
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
      <CompaniesProvider>
        <CompaniesTable />
      </CompaniesProvider>
    </QueryClientProvider>
  )
}

describe('CompaniesTable', () => {
  it('shows skeleton rows while loading', async () => {
    mockedGetCompanies.mockReturnValue(never())
    const { container } = await renderTable()

    const pulses = container.querySelectorAll('.animate-pulse')
    expect(pulses.length).toBe(6)
  })

  it('shows error state with retry that reloads the list', async () => {
    mockedGetCompanies.mockRejectedValueOnce(new Error('boom'))
    mockedGetCompanies.mockResolvedValueOnce(page([baseCompany]))
    const screen = await renderTable()

    await expect
      .element(screen.getByText('Không tải được danh sách công ty'))
      .toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Thử lại' }))
    await expect.element(screen.getByText('Công ty A')).toBeInTheDocument()
  })

  it('renders company rows with badges for assigned price lists', async () => {
    mockedGetCompanies.mockResolvedValue(page([
      baseCompany,
      { ...baseCompany, id: 'co-2', name: 'Chuỗi B', priceListId: null },
    ]))
    const screen = await renderTable()

    await expect.element(screen.getByText('Công ty A')).toBeInTheDocument()
    await expect.element(screen.getByText('Chuỗi B')).toBeInTheDocument()
    await expect.element(screen.getByText('Đã gán')).toBeInTheDocument()
    await expect.element(screen.getByText('Chưa gán')).toBeInTheDocument()
    await expect
      .element(screen.getByRole('button', { name: 'Chỉnh sửa công ty' }).first())
      .toBeInTheDocument()
    await expect
      .element(screen.getByRole('button', { name: 'Xóa công ty' }).first())
      .toBeInTheDocument()
  })

  it('renders the empty-state cell when there are no companies', async () => {
    mockedGetCompanies.mockResolvedValue(page([]))
    const screen = await renderTable()

    await expect.element(screen.getByText('Không có dữ liệu.')).toBeInTheDocument()
  })
})
