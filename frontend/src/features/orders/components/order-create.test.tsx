import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OrderCreate } from './order-create'

const m = vi.hoisted(() => ({
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
  createOrder: vi.fn(),
  getCustomers: vi.fn(),
  getCompanyById: vi.fn(),
  getPriceListByCompany: vi.fn(),
  getPriceListById: vi.fn(),
  searchProducts: vi.fn(),
  getProducts: vi.fn(),
  getBusinessEntities: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { error: m.toastError, success: m.toastSuccess },
}))

vi.mock('@/services/orders', () => ({ createOrder: m.createOrder }))

vi.mock('@/services/customers', () => ({ getCustomers: m.getCustomers }))

vi.mock('@/services/companies', () => ({ getCompanyById: m.getCompanyById }))

vi.mock('@/services/price-lists', () => ({
  getPriceListByCompany: m.getPriceListByCompany,
  getPriceListById: m.getPriceListById,
}))

vi.mock('@/services/products', () => ({
  searchProducts: m.searchProducts,
  getProducts: m.getProducts,
}))

vi.mock('@/services/business-entities', () => ({
  getBusinessEntities: m.getBusinessEntities,
}))

// App chrome only — the layout/header provider stack is not part of this
// component's contract; children stay rendered so the title stays asserted.
vi.mock('@/components/layout/header', () => ({
  Header: ({ children }: { children?: ReactNode }) => <header>{children}</header>,
}))

const customer = {
  id: 'c1',
  code: 'KH001',
  name: 'Nhà hàng Hoa Sứ',
  companyId: 'co1',
  companyName: 'Công ty Hoa Sứ',
  priceListId: null,
  phone: '0901234567',
  email: null,
  taxId: null,
  address: null,
  isActive: true,
}

const company = {
  id: 'co1',
  name: 'Công ty Hoa Sứ',
  taxCode: null,
  priceListId: null,
  address: null,
  phone: null,
  email: null,
}

const priceList = {
  id: 'pl1',
  name: 'Bảng giá Hoa Sứ',
  companyId: 'co1',
  companyName: 'Công ty Hoa Sứ',
  isDefault: false,
  description: null,
  itemCount: 1,
}

const product = {
  id: 'p1',
  code: 'SP001',
  name: 'Tôm sú',
  description: '',
  categoryId: null,
  categoryName: 'Hải sản',
  category: null,
  unitId: null,
  unitName: 'kg',
  unit: null,
  purchasePrice: 90000,
  defaultSalePrice: 120000,
  stockQuantity: 0,
  isActive: true,
}

const product2 = {
  ...product,
  id: 'p2',
  code: 'SP002',
  name: 'Cá basa',
  defaultSalePrice: 45000,
}

const priceListDetail = {
  priceList,
  items: [
    {
      productId: 'p1',
      code: 'SP001',
      name: 'Tôm sú',
      unit: 'kg',
      stockQuantity: 0,
      basePrice: 130000,
      customPrice: 125000,
      hasOverride: true,
    },
  ],
}

const businessEntity = {
  id: 'be1',
  name: 'Hộ kinh doanh Chính',
  taxCode: null,
  address: null,
  phone: null,
  headerLines: [],
}

const orderDetail = {
  id: 'o1',
  code: 'ORD-1025',
  customerId: 'c1',
  customerName: 'Nhà hàng Hoa Sứ',
  companyId: 'co1',
  businessEntityId: 'be1',
  businessEntityName: 'Hộ kinh doanh Chính',
  status: 'confirmed',
  subtotal: 120000,
  discount: 0,
  total: 120000,
  paidAmount: 0,
  notes: null,
  createdAt: '2026-09-27T10:00:00.000Z',
  customerCode: 'KH001',
  companyName: 'Công ty Hoa Sứ',
  items: [],
  payments: [],
}

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

async function renderOrderCreate() {
  return render(<OrderCreate />, { wrapper: makeWrapper() })
}

describe('OrderCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    m.createOrder.mockResolvedValue(orderDetail)
    m.getCustomers.mockResolvedValue({ data: [customer], meta: { total: 1 } })
    m.getCompanyById.mockResolvedValue(company)
    m.getPriceListByCompany.mockResolvedValue(priceList)
    m.getPriceListById.mockResolvedValue(priceListDetail)
    m.searchProducts.mockResolvedValue([product, product2])
    m.getProducts.mockResolvedValue([product, product2])
    m.getBusinessEntities.mockResolvedValue([businessEntity])
  })

  it('renders the page title and desktop POS sections', async () => {
    const { getByText, getByRole } = await renderOrderCreate()

    await expect.element(getByText('Tạo đơn hàng mới')).toBeInTheDocument()
    await expect.element(getByText('Sản phẩm & Giỏ hàng')).toBeInTheDocument()
    await expect.element(getByText('Khách hàng & Bảng giá')).toBeInTheDocument()
    await expect.element(getByText('Tổng kết & Thanh toán')).toBeInTheDocument()
    await expect
      .element(getByRole('button', { name: 'Lưu và tạo hóa đơn' }))
      .toBeInTheDocument()
  })

  it('numbers the steps in task order — customer, then cart, then summary', async () => {
    // The badge numbers describe the order of work, so they must be identical
    // on mobile and desktop. Mobile stacks customer(1) -> cart(2); desktop used
    // to run cart(1) -> customer(2) -> summary(3), which told the same user two
    // different stories about the same task.
    const { container } = await renderOrderCreate()

    const numbered = Array.from(container.querySelectorAll('section[data-step]')).map((s) => [
      s.getAttribute('data-step'),
      s.querySelector('h3')?.textContent?.trim(),
    ])

    expect(numbered).toEqual([
      ['1', 'Khách hàng & Bảng giá'],
      ['2', 'Sản phẩm & Giỏ hàng'],
      ['3', 'Tổng kết & Thanh toán'],
    ])
  })

  it('totals correctly when the API returns prices as strings', async () => {
    // Regression: every money column is numeric(15,2) in Postgres, so Drizzle
    // hands these back as strings. `0 + "120000.00" + "90000.00"` concatenates
    // to "0120000.0090000.00" and the summary then rendered a literal "NaN đ".
    const stringPriced = {
      ...product,
      defaultSalePrice: '120000.00',
      purchasePrice: '90000.00',
    }
    m.getProducts.mockResolvedValue([stringPriced, { ...product2, defaultSalePrice: '90000.00' }])
    // Exercise both price paths as strings: p1 resolves through the price
    // list's customPrice, p2 falls back to the product's defaultSalePrice.
    m.getPriceListById.mockResolvedValue({
      priceList,
      items: [{ ...priceListDetail.items[0], customPrice: '125000.00' }],
    })
    m.getPriceListByCompany.mockResolvedValue({
      priceList,
      items: [{ ...priceListDetail.items[0], customPrice: '125000.00' }],
    })
    const screen = await renderOrderCreate()

    const productInput = screen.getByPlaceholder('Gõ tên hàng để thêm...')
    await userEvent.fill(productInput, 'Tôm')
    await userEvent.click(screen.getByRole('button', { name: /Tôm sú/ }))
    await userEvent.fill(productInput, 'Cá')
    await userEvent.click(screen.getByRole('button', { name: /Cá basa/ }))

    // The summary is what broke, and both layouts render it.
    await expect.element(screen.getByText('Tổng tiền hàng:')).toBeInTheDocument()

    // Assert on the figure in the row, not a hard-coded layout.
    const summaryRow = screen.getByText('Tổng tiền hàng:').element().closest('div')!
    const subtotalShown = summaryRow.textContent ?? ''
    expect(subtotalShown).toMatch(/165\.000 đ/)
    expect(subtotalShown).not.toContain('NaN')

    const dueRow = screen.getByText('Khách cần trả:').element().closest('div')!
    expect(dueRow.textContent).toMatch(/165\.000 đ/)
    expect(dueRow.textContent).not.toContain('NaN')
  })

  it('marks a step complete as its condition is met', async () => {
    const screen = await renderOrderCreate()

    // Nothing is done yet.
    expect(screen.container.querySelector('section[data-step="1"]')?.getAttribute('data-complete')).toBeNull()
    expect(screen.container.querySelector('section[data-step="2"]')?.getAttribute('data-complete')).toBeNull()

    // Choosing a customer completes step 1.
    await userEvent.click(screen.getByPlaceholder('Tìm khách hàng...'))
    await userEvent.click(screen.getByRole('button', { name: /Nhà hàng Hoa Sứ/ }))
    await expect
      .element(screen.container.querySelector<HTMLElement>('section[data-step="1"]')!)
      .toHaveAttribute('data-complete', 'true')

    // Adding a line completes step 2.
    const productInput = screen.getByPlaceholder('Gõ tên hàng để thêm...')
    await userEvent.fill(productInput, 'Tôm')
    await userEvent.click(screen.getByRole('button', { name: /Tôm sú/ }))
    await expect
      .element(screen.container.querySelector<HTMLElement>('section[data-step="2"]')!)
      .toHaveAttribute('data-complete', 'true')
  })

  it('blocks submit without a customer', async () => {
    const { getByRole } = await renderOrderCreate()

    await userEvent.click(getByRole('button', { name: 'Lưu và tạo hóa đơn' }))

    await vi.waitFor(() =>
      expect(m.toastError).toHaveBeenCalledWith('Vui lòng chọn khách hàng')
    )
    expect(m.createOrder).not.toHaveBeenCalled()
  })

  it('blocks submit with a customer but no items', async () => {
    const screen = await renderOrderCreate()

    await userEvent.click(screen.getByPlaceholder('Tìm khách hàng...'))
    await userEvent.click(screen.getByRole('button', { name: /Nhà hàng Hoa Sứ/ }))

    await expect.element(screen.getByText('Nhà hàng Hoa Sứ')).toBeInTheDocument()
    await expect
      .element(screen.getByText(/Bảng giá tự động: Bảng giá Hoa Sứ/))
      .toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Lưu và tạo hóa đơn' }))

    await vi.waitFor(() =>
      expect(m.toastError).toHaveBeenCalledWith('Vui lòng thêm ít nhất một sản phẩm')
    )
    expect(m.createOrder).not.toHaveBeenCalled()
  })

  it('creates the order with selected customer, priced items, and shows the success dialog', async () => {
    const screen = await renderOrderCreate()

    // Selecting the customer enables the by-company price-list query; the
    // page derives priceListId from that query, so the FIRST selection
    // already prices products from the customer's price list.
    await userEvent.click(screen.getByPlaceholder('Tìm khách hàng...'))
    await userEvent.click(screen.getByRole('button', { name: /Nhà hàng Hoa Sứ/ }))

    await expect.element(screen.getByText('Nhà hàng Hoa Sứ')).toBeInTheDocument()
    await expect
      .element(screen.getByText(/Bảng giá tự động: Bảng giá Hoa Sứ/))
      .toBeInTheDocument()

    // Add a product that IS in the price list — the dropdown shows the
    // price-list price (customPrice 125.000) once the detail query lands.
    const productInput = screen.getByPlaceholder('Gõ tên hàng để thêm...')
    await userEvent.fill(productInput, 'Tôm')
    await expect.element(screen.getByText('125.000 đ')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Tôm sú/ }))

    await expect.element(screen.getByText('1 mặt hàng đã chọn')).toBeInTheDocument()
    await expect.element(screen.getByText('125.000 đ').first()).toBeInTheDocument()

    // Add a second product: not in the price list → default price
    await userEvent.fill(productInput, 'Cá')
    await userEvent.click(screen.getByRole('button', { name: /Cá basa/ }))

    await expect.element(screen.getByText('2 mặt hàng đã chọn')).toBeInTheDocument()
    await expect.element(screen.getByText('45.000 đ').first()).toBeInTheDocument()

    // Business entity auto-selects once loaded
    await expect.element(screen.getByText('Cơ sở Chính')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Lưu và tạo hóa đơn' }))

    await vi.waitFor(() => expect(m.createOrder).toHaveBeenCalledOnce())
    expect(m.createOrder).toHaveBeenCalledWith({
      customerId: 'c1',
      businessEntityId: 'be1',
      items: [
        { productId: 'p1', quantity: 1, unitPrice: 125000 },
        { productId: 'p2', quantity: 1, unitPrice: 45000 },
      ],
      discount: 0,
    })

    await expect
      .element(screen.getByText('Tạo đơn hàng thành công!'))
      .toBeInTheDocument()
    await expect.element(screen.getByText('ORD-1025')).toBeInTheDocument()
    expect(m.toastError).not.toHaveBeenCalled()
  })
})
