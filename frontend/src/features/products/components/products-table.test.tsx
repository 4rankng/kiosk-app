import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProductsTable } from './products-table'

const m = vi.hoisted(() => ({
  getProducts: vi.fn(),
  getCategories: vi.fn(),
}))

vi.mock('@/services/products', () => ({ getProducts: m.getProducts }))

vi.mock('@/services/categories', () => ({ getCategories: m.getCategories }))

const products = [
  {
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
  },
  {
    id: 'p2',
    code: 'SP002',
    name: 'Cá basa',
    description: '',
    categoryId: null,
    categoryName: 'Gia vị',
    category: null,
    unitId: null,
    unitName: 'kg',
    unit: null,
    purchasePrice: 50000,
    defaultSalePrice: 45000,
    stockQuantity: 0,
    isActive: true,
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

async function renderProductsTable() {
  return render(
    <ProductsTable
      onEdit={vi.fn()}
      onDelete={vi.fn()
      }
    />,
    { wrapper: makeWrapper() }
  )
}

describe('ProductsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    m.getProducts.mockResolvedValue(products)
    m.getCategories.mockResolvedValue([
      { id: 'cat1', name: 'Hải sản' },
      { id: 'cat2', name: 'Gia vị' },
    ])
  })

  it('renders product rows with formatted prices', async () => {
    const screen = await renderProductsTable()

    await expect.element(screen.getByText('SP001')).toBeInTheDocument()
    await expect.element(screen.getByText('Tôm sú')).toBeInTheDocument()
    await expect.element(screen.getByText('90.000 đ')).toBeInTheDocument()
    await expect
      .element(screen.getByText('120.000 đ', { exact: true }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('45.000 đ', { exact: true }))
      .toBeInTheDocument()
  })

  it('shows the loading state before data arrives', async () => {
    let resolveProducts!: (value: unknown) => void
    m.getProducts.mockReturnValue(
      new Promise((resolve) => {
        resolveProducts = resolve
      })
    )
    const screen = await renderProductsTable()

    await expect
      .element(screen.getByPlaceholder('Tìm mã hàng, tên sản phẩm...'))
      .not.toBeInTheDocument()

    resolveProducts(products)
    await expect
      .element(screen.getByPlaceholder('Tìm mã hàng, tên sản phẩm...'))
      .toBeInTheDocument()
  })

  it('shows the error state with retry that refetches', async () => {
    m.getProducts.mockRejectedValue(new Error('boom'))
    const screen = await renderProductsTable()

    await expect
      .element(screen.getByText('Không tải được danh sách sản phẩm'))
      .toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Thử lại' }))
    await vi.waitFor(() => expect(m.getProducts.mock.calls.length).toBeGreaterThanOrEqual(2))
  })

  it('filters products by search across name and code', async () => {
    const screen = await renderProductsTable()

    await expect.element(screen.getByText('SP001')).toBeInTheDocument()

    await userEvent.fill(screen.getByPlaceholder('Tìm mã hàng, tên sản phẩm...'), 'cá')
    await expect.element(screen.getByText('SP002')).toBeInTheDocument()
    await expect
      .element(screen.getByText('SP001'))
      .not.toBeInTheDocument()

    await userEvent.fill(screen.getByPlaceholder('Tìm mã hàng, tên sản phẩm...'), 'zzz')
    await expect
      .element(screen.getByText('Không có dữ liệu.'))
      .toBeInTheDocument()
  })
})
