import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PriceListTable } from './price-list-table'

const m = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  bulkUpsertPriceListItems: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { error: m.toastError, success: m.toastSuccess },
}))

vi.mock('@/services/price-lists', () => ({
  bulkUpsertPriceListItems: m.bulkUpsertPriceListItems,
}))

const priceList = {
  id: 'pl1',
  name: 'Bảng giá Hoa Sứ',
  companyId: 'co1',
  companyName: 'Công ty Hoa Sứ',
  isDefault: false,
  description: null,
  itemCount: 2,
}

const items = [
  {
    productId: 'p1',
    code: 'SP001',
    name: 'Tôm sú',
    unit: 'kg',
    stockQuantity: 0,
    basePrice: 130000,
    customPrice: 12000,
    hasOverride: true,
  },
  {
    productId: 'p2',
    code: 'SP002',
    name: 'Cá basa',
    unit: 'kg',
    stockQuantity: 5,
    basePrice: 9000,
    customPrice: 8000,
    hasOverride: false,
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

async function renderPriceListTable() {
  return render(<PriceListTable priceList={priceList} items={items} />, {
    wrapper: makeWrapper(),
  })
}

describe('PriceListTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    m.bulkUpsertPriceListItems.mockResolvedValue({ upserted: 2 })
  })

  it('renders items with formatted base prices and editable custom prices', async () => {
    const screen = await renderPriceListTable()

    await expect.element(screen.getByText('Mã hàng')).toBeInTheDocument()
    await expect.element(screen.getByText('SP001')).toBeInTheDocument()
    await expect.element(screen.getByText(/Tôm sú/)).toBeInTheDocument()
    await expect.element(screen.getByText('130.000 đ')).toBeInTheDocument()
    await expect.element(screen.getByText('9.000 đ')).toBeInTheDocument()

    // NumberInput shows custom prices in X.XXX format
    const inputValues = (await screen.getByRole('textbox').elements()).map(
      (el) => (el as HTMLInputElement).value
    )
    expect(inputValues).toEqual(expect.arrayContaining(['12.000', '8.000']))
  })

  it('filters items by search and shows the empty row', async () => {
    const screen = await renderPriceListTable()

    await userEvent.fill(screen.getByPlaceholder('Tìm kiếm mặt hàng...'), 'cá')
    await expect.element(screen.getByText('SP002')).toBeInTheDocument()
    await expect
      .element(screen.getByText('SP001'))
      .not.toBeInTheDocument()

    await userEvent.fill(screen.getByPlaceholder('Tìm kiếm mặt hàng...'), 'zzz')
    await expect
      .element(screen.getByText('Không tìm thấy mặt hàng.'))
      .toBeInTheDocument()
  })

  it('saves all items with their custom prices and toasts success', async () => {
    const screen = await renderPriceListTable()

    await userEvent.click(screen.getByRole('button', { name: 'Lưu bảng giá' }))

    await vi.waitFor(() =>
      expect(m.bulkUpsertPriceListItems).toHaveBeenCalledWith('pl1', [
        { productId: 'p1', customPrice: 12000 },
        { productId: 'p2', customPrice: 8000 },
      ])
    )
    await vi.waitFor(() =>
      expect(m.toastSuccess).toHaveBeenCalledWith('Lưu bảng giá thành công!')
    )
    expect(m.toastError).not.toHaveBeenCalled()
  })

  it('sends the edited custom price', async () => {
    const screen = await renderPriceListTable()

    // Locate the Tôm sú custom-price input by its formatted display value
    const textboxes = screen.getByRole('textbox')
    const values = (await textboxes.elements()).map(
      (el) => (el as HTMLInputElement).value
    )
    const priceInput = textboxes.nth(values.indexOf('12.000'))
    await userEvent.fill(priceInput, '15.000')
    await userEvent.click(screen.getByRole('button', { name: 'Lưu bảng giá' }))

    await vi.waitFor(() =>
      expect(m.bulkUpsertPriceListItems).toHaveBeenCalledWith('pl1', [
        { productId: 'p1', customPrice: 15000 },
        { productId: 'p2', customPrice: 8000 },
      ])
    )
  })
})
