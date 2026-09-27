import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Products } from './index'

const m = vi.hoisted(() => ({
  getProducts: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  getCategories: vi.fn(),
  createCategory: vi.fn(),
  getUnits: vi.fn(),
  createUnit: vi.fn(),
}))

vi.mock('@/services/products', () => ({
  getProducts: m.getProducts,
  createProduct: m.createProduct,
  updateProduct: m.updateProduct,
  deleteProduct: m.deleteProduct,
}))

vi.mock('@/services/categories', () => ({
  getCategories: m.getCategories,
  createCategory: m.createCategory,
}))

vi.mock('@/services/units', () => ({
  getUnits: m.getUnits,
  createUnit: m.createUnit,
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

async function renderProducts() {
  return render(<Products />, { wrapper: makeWrapper() })
}

describe('Products page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    m.getProducts.mockResolvedValue(products)
    m.getCategories.mockResolvedValue([
      { id: 'cat1', name: 'Hải sản' },
      { id: 'cat2', name: 'Gia vị' },
    ])
    m.getUnits.mockResolvedValue([{ id: 'u1', name: 'kg' }])
  })

  it('renders summary stats with formatted money values', async () => {
    const screen = await renderProducts()

    await expect
      .element(screen.getByText('2 sản phẩm · 2 nhóm hàng'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('Sản phẩm', { exact: true }).first())
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('2', { exact: true }).first())
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('140.000 đ'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('82.500 đ'))
      .toBeInTheDocument()
  })

  it('opens the edit dialog prefilled from the row action menu', async () => {
    const screen = await renderProducts()

    await expect.element(screen.getByText('SP001')).toBeInTheDocument()

    // Open the row action dropdown and choose edit
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }).first())
    await userEvent.click(screen.getByRole('menuitem', { name: 'Chỉnh sửa' }))

    await expect
      .element(screen.getByText('Chỉnh sửa sản phẩm'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('Nhập thông tin để tạo sản phẩm mới.').last())
      .not.toBeInTheDocument()
  })

  it('opens the delete confirmation with the destructive copy', async () => {
    const screen = await renderProducts()

    await expect.element(screen.getByText('SP001')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }).first())
    await userEvent.click(screen.getByRole('menuitem', { name: 'Xóa' }))

    await expect
      .element(screen.getByText('Xóa sản phẩm').first())
      .toBeInTheDocument()
    await expect
      .element(
        screen.getByText(
          'Bạn có chắc muốn xóa sản phẩm này? Hành động này không thể hoàn tác.'
        )
      )
      .toBeInTheDocument()
  })
})
