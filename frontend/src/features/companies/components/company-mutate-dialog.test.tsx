import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Company } from '@/types/company'
import type { PriceList } from '@/types/price-list'
import { createCompany, updateCompany } from '@/services/companies'
import { getPriceLists } from '@/services/price-lists'
import { CompaniesProvider, useCompaniesContext } from './companies-provider'
import { CompanyMutateDialog } from './company-mutate-dialog'

vi.mock('@/services/companies', () => ({ createCompany: vi.fn(), updateCompany: vi.fn() }))
vi.mock('@/services/price-lists', () => ({ getPriceLists: vi.fn() }))

const mockedCreateCompany = vi.mocked(createCompany)
const mockedUpdateCompany = vi.mocked(updateCompany)
const mockedGetPriceLists = vi.mocked(getPriceLists)

const baseCompany: Company = {
  id: 'co-1',
  name: 'Công ty A',
  taxCode: '0123456789',
  priceListId: 'pl-1',
  address: null,
  phone: null,
  email: null,
}

const priceLists: PriceList[] = [
  { id: 'pl-1', name: 'Bảng giá 2026', companyId: null, companyName: null, isDefault: false, description: null, itemCount: 12 },
  { id: 'pl-2', name: 'Bảng giá Năm mới', companyId: null, companyName: null, isDefault: false, description: null, itemCount: 8 },
]

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

function Harness({ company }: { company: Company | null }) {
  const { setOpen, setSelectedCompany } = useCompaniesContext()
  return (
    <>
      <button
        type='button'
        onClick={() => {
          setSelectedCompany(company)
          setOpen(company ? 'edit' : 'add')
        }}
      >
        mở-dialog
      </button>
      <CompanyMutateDialog />
    </>
  )
}

async function renderDialog(company: Company | null) {
  const queryClient = makeQueryClient()
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
  const screen = await render(
    <QueryClientProvider client={queryClient}>
      <CompaniesProvider>
        <Harness company={company} />
      </CompaniesProvider>
    </QueryClientProvider>
  )
  return { screen, invalidateSpy }
}

async function openDialog(screen: Awaited<ReturnType<typeof renderDialog>>['screen']) {
  mockedGetPriceLists.mockResolvedValue(priceLists)
  await userEvent.click(screen.getByRole('button', { name: 'mở-dialog' }))
  await expect
    .element(screen.getByRole('heading', { name: /công ty/ }))
    .toBeInTheDocument()
}

// The dialog's ['price-lists'] query fires on mount, before openDialog seeds
// the mock — give every render a defined value so react-query never sees
// an undefined query result.
beforeEach(() => {
  mockedGetPriceLists.mockResolvedValue(priceLists)
})

describe('CompanyMutateDialog', () => {
  it('opens in add mode with title and action buttons', async () => {
    const { screen } = await renderDialog(null)
    await openDialog(screen)

    await expect
      .element(screen.getByRole('heading', { name: 'Thêm công ty/chuỗi mới' }))
      .toBeInTheDocument()
    await expect.element(screen.getByRole('button', { name: 'Tạo mới' })).toBeInTheDocument()
    await expect.element(screen.getByRole('button', { name: 'Hủy bỏ' })).toBeInTheDocument()
  })

  it('shows validation error when name is missing', async () => {
    const { screen } = await renderDialog(null)
    await openDialog(screen)

    await userEvent.click(screen.getByRole('button', { name: 'Tạo mới' }))

    await expect
      .element(screen.getByText('Tên công ty là bắt buộc.'))
      .toBeInTheDocument()
    expect(mockedCreateCompany).not.toHaveBeenCalled()
  })

  it('submits a new company with null contact fields and the selected price list', async () => {
    mockedCreateCompany.mockResolvedValue(baseCompany)
    const { screen, invalidateSpy } = await renderDialog(null)
    await openDialog(screen)

    await userEvent.fill(screen.getByRole('textbox', { name: 'Tên công ty' }), 'Chuỗi Nhà hàng Xanh')
    await userEvent.fill(screen.getByRole('textbox', { name: 'MST' }), '0987654321')
    await userEvent.click(screen.getByText('Chọn bảng giá...'))
    await userEvent.click(screen.getByRole('option', { name: 'Bảng giá Năm mới' }))

    await userEvent.click(screen.getByRole('button', { name: 'Tạo mới' }))

    // onSuccess closes the dialog; wait for that, then assert the side effects.
    await expect
      .element(screen.getByRole('heading', { name: 'Thêm công ty/chuỗi mới' }))
      .not.toBeInTheDocument()
    expect(mockedCreateCompany).toHaveBeenCalledWith({
      name: 'Chuỗi Nhà hàng Xanh',
      taxCode: '0987654321',
      priceListId: 'pl-2',
      address: null,
      email: null,
      phone: null,
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['companies'] })
  })

  it('opens in edit mode pre-filled and submits updates to the selected company', async () => {
    mockedUpdateCompany.mockResolvedValue(baseCompany)
    const { screen, invalidateSpy } = await renderDialog(baseCompany)
    await openDialog(screen)

    await expect
      .element(screen.getByRole('heading', { name: 'Chỉnh sửa công ty' }))
      .toBeInTheDocument()

    const nameInput = screen.getByRole('textbox', { name: 'Tên công ty' })
    expect((nameInput.element() as HTMLInputElement).value).toBe('Công ty A')

    await userEvent.click(screen.getByRole('button', { name: 'Cập nhật' }))

    // onSuccess closes the dialog; wait for that, then assert the side effects.
    await expect
      .element(screen.getByRole('heading', { name: 'Chỉnh sửa công ty' }))
      .not.toBeInTheDocument()
    expect(mockedUpdateCompany).toHaveBeenCalledWith('co-1', {
      name: 'Công ty A',
      taxCode: '0123456789',
      priceListId: 'pl-1',
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['companies'] })
  })

  it('closes the dialog when cancel is clicked', async () => {
    const { screen } = await renderDialog(null)
    await openDialog(screen)

    await userEvent.click(screen.getByRole('button', { name: 'Hủy bỏ' }))

    await expect
      .element(screen.getByRole('heading', { name: 'Thêm công ty/chuỗi mới' }))
      .not.toBeInTheDocument()
  })
})
