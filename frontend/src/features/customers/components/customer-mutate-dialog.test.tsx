import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Customer } from '@/types'
import { createCustomer, updateCustomer } from '@/services/customers'
import { getCompanies } from '@/services/companies'
import type { Company } from '@/types/company'
import type { PaginatedResponse } from '@/lib/api-client'
import { CustomersProvider, useCustomersContext } from './customers-provider'
import { CustomerMutateDialog } from './customer-mutate-dialog'

vi.mock('@/services/customers', () => ({ createCustomer: vi.fn(), updateCustomer: vi.fn() }))
vi.mock('@/services/companies', () => ({ getCompanies: vi.fn() }))

const mockedCreateCustomer = vi.mocked(createCustomer)
const mockedUpdateCustomer = vi.mocked(updateCustomer)
const mockedGetCompanies = vi.mocked(getCompanies)

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

function page(data: { id: string; name: string }[]): PaginatedResponse<Company> {
  return {
    data: data.map((c) => ({ ...c, taxCode: null, priceListId: null, address: null, phone: null, email: null })),
    meta: { page: 1, pageSize: 20, total: data.length, totalPages: 1 },
  }
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

function Harness({ customer }: { customer: Customer | null }) {
  const { setOpen, setSelectedCustomer } = useCustomersContext()
  return (
    <>
      <button
        type='button'
        onClick={() => {
          setSelectedCustomer(customer)
          setOpen(customer ? 'edit' : 'add')
        }}
      >
        mở-dialog
      </button>
      <CustomerMutateDialog />
    </>
  )
}

async function renderDialog(customer: Customer | null) {
  const queryClient = makeQueryClient()
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
  const screen = await render(
    <QueryClientProvider client={queryClient}>
      <CustomersProvider>
        <Harness customer={customer} />
      </CustomersProvider>
    </QueryClientProvider>
  )
  return { screen, invalidateSpy }
}

async function openDialog(
  screen: Awaited<ReturnType<typeof renderDialog>>['screen'],
  companies: { id: string; name: string }[] = [{ id: 'co-1', name: 'Công ty A' }]
) {
  mockedGetCompanies.mockResolvedValue(page(companies))
  await userEvent.click(screen.getByRole('button', { name: 'mở-dialog' }))
  await expect
    .element(screen.getByRole('heading', { name: /khách hàng/ }))
    .toBeInTheDocument()
}

describe('CustomerMutateDialog', () => {
  it('opens in add mode with title and action button', async () => {
    const { screen } = await renderDialog(null)
    await openDialog(screen)

    await expect
      .element(screen.getByRole('heading', { name: 'Thêm mới khách hàng' }))
      .toBeInTheDocument()
    await expect.element(screen.getByRole('button', { name: 'Tạo mới' })).toBeInTheDocument()
    await expect.element(screen.getByRole('button', { name: 'Hủy bỏ' })).toBeInTheDocument()
  })

  it('shows validation errors when submitting an empty form', async () => {
    const { screen } = await renderDialog(null)
    await openDialog(screen)

    await userEvent.click(screen.getByRole('button', { name: 'Tạo mới' }))

    await expect
      .element(screen.getByText('Vui lòng nhập mã khách hàng'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('Vui lòng nhập tên nhà hàng'))
      .toBeInTheDocument()
    await expect.element(screen.getByText('Vui lòng chọn công ty')).toBeInTheDocument()
    await expect.element(screen.getByText('Email không hợp lệ')).toBeInTheDocument()
    expect(mockedCreateCustomer).not.toHaveBeenCalled()
  })

  it('submits a new customer with the entered values', async () => {
    mockedCreateCustomer.mockResolvedValue(baseCustomer)
    const { screen, invalidateSpy } = await renderDialog(null)
    await openDialog(screen)

    await userEvent.fill(screen.getByRole('textbox', { name: 'Mã KH' }), 'KH002')
    await userEvent.fill(screen.getByRole('textbox', { name: 'Tên nhà hàng' }), 'Nhà hàng Hoa Sữa')
    await userEvent.click(screen.getByText('Chọn công ty...'))
    await userEvent.click(screen.getByRole('option', { name: 'Công ty A' }))
    await userEvent.fill(screen.getByRole('textbox', { name: 'Điện thoại' }), '0987 654 321')
    await userEvent.fill(screen.getByRole('textbox', { name: 'Email' }), 'hoa@sua.vn')
    await userEvent.fill(screen.getByRole('textbox', { name: 'Địa chỉ' }), '34 Lê Lợi')

    await userEvent.click(screen.getByRole('button', { name: 'Tạo mới' }))

    // onSuccess closes the dialog; wait for that, then assert the side effects.
    await expect
      .element(screen.getByRole('heading', { name: 'Thêm mới khách hàng' }))
      .not.toBeInTheDocument()
    expect(mockedCreateCustomer).toHaveBeenCalledWith({
      code: 'KH002',
      name: 'Nhà hàng Hoa Sữa',
      companyId: 'co-1',
      phone: '0987 654 321',
      email: 'hoa@sua.vn',
      address: '34 Lê Lợi',
      taxId: '',
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['customers'] })
  })

  it('opens in edit mode pre-filled and submits updates to the selected customer', async () => {
    mockedUpdateCustomer.mockResolvedValue(baseCustomer)
    const { screen, invalidateSpy } = await renderDialog(baseCustomer)
    await openDialog(screen)

    await expect
      .element(screen.getByRole('heading', { name: 'Chỉnh sửa khách hàng' }))
      .toBeInTheDocument()

    const nameInput = screen.getByRole('textbox', { name: 'Tên nhà hàng' })
    expect((nameInput.element() as HTMLInputElement).value).toBe('Quán Cô Ba')

    await userEvent.click(screen.getByRole('button', { name: 'Cập nhật' }))

    // onSuccess closes the dialog; wait for that, then assert the side effects.
    await expect
      .element(screen.getByRole('heading', { name: 'Chỉnh sửa khách hàng' }))
      .not.toBeInTheDocument()
    expect(mockedUpdateCustomer).toHaveBeenCalledWith('cu-1', {
      code: 'KH001',
      name: 'Quán Cô Ba',
      companyId: 'co-1',
      phone: '0901 234 567',
      email: 'coba@example.com',
      address: '12 Nguyễn Trãi, Q1',
      taxId: '0312345678',
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['customers'] })
  })

  it('closes the dialog when cancel is clicked', async () => {
    const { screen } = await renderDialog(null)
    await openDialog(screen)

    await userEvent.click(screen.getByRole('button', { name: 'Hủy bỏ' }))

    await expect
      .element(screen.getByRole('heading', { name: 'Thêm mới khách hàng' }))
      .not.toBeInTheDocument()
  })
})
