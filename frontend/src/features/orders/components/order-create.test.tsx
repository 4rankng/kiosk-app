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

    // First customer selection: the by-company price-list query is still
    // disabled at click time, so the captured priceListId is '' (current
    // behavior) and products price from defaultSalePrice.
    await userEvent.click(screen.getByPlaceholder('Tìm khách hàng...'))
    await userEvent.click(screen.getByRole('button', { name: /Nhà hàng Hoa Sứ/ }))

    await expect.element(screen.getByText('Nhà hàng Hoa Sứ')).toBeInTheDocument()
    await expect
      .element(screen.getByText(/Bảng giá tự động: Bảng giá Hoa Sứ/))
      .toBeInTheDocument()

    // Add a product through the product search — default-price fallback path
    const productInput = screen.getByPlaceholder('Gõ tên hàng để thêm...')
    await userEvent.fill(productInput, 'Tôm')
    await userEvent.click(screen.getByRole('button', { name: /Tôm sú/ }))

    // Line item keeps the default sale price (120.000), fixed at add time
    await expect.element(screen.getByText('120.000 đ').first()).toBeInTheDocument()
    await expect.element(screen.getByText('1 mặt hàng đã chọn')).toBeInTheDocument()

    // Re-select the same customer — the price list is cached now, so the
    // second selection captures priceListId 'pl1' and new adds use its prices.
    await userEvent.click(screen.getByRole('button', { name: 'Thay đổi' }))
    await vi.waitFor(() =>
      expect(m.getPriceListByCompany).toHaveBeenCalledOnce()
    )
    await userEvent.click(screen.getByPlaceholder('Tìm khách hàng...'))
    await userEvent.click(screen.getByRole('button', { name: /Nhà hàng Hoa Sứ/ }))

    // Add a second product: not in the price list → default price again
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
        { productId: 'p1', quantity: 1, unitPrice: 120000 },
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
