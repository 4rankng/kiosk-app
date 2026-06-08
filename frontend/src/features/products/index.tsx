import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { NotificationBell } from '@/components/notification-bell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Tags, TrendingUp, Plus } from 'lucide-react'
import { ProductsDialogs } from './components/products-dialogs'
import { ProductsProvider, useProductsContext } from './components/products-provider'
import { ProductsTable } from './components/products-table'
import { getProducts } from '@/services/products'
import { formatCurrency } from '@/lib/format'
import { useIsMobile } from '@/hooks/use-mobile'
import type { Product } from '@/types'

function AddProductButton() {
  const { setOpen } = useProductsContext()
  return (
    <Button onClick={() => setOpen('add')}>
      <Plus className='mr-2 h-4 w-4' />
      Thêm
    </Button>
  )
}

function ProductsContent() {
  const { setOpen, setSelectedProduct } = useProductsContext()
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: getProducts })
  const isMobile = useIsMobile()

  const stats = useMemo(() => {
    const categories = new Set(products.map((p) => p.category))
    const totalInventoryValue = products.reduce((sum, p) => sum + p.purchasePrice, 0)
    const avgSalePrice = products.length > 0
      ? products.reduce((sum, p) => sum + p.defaultSalePrice, 0) / products.length
      : 0
    return {
      total: products.length,
      categories: categories.size,
      inventoryValue: totalInventoryValue,
      avgPrice: avgSalePrice,
    }
  }, [products])

  function handleEdit(product: Product) {
    setSelectedProduct(product)
    setOpen('edit')
  }

  function handleDelete(product: Product) {
    setSelectedProduct(product)
    setOpen('delete')
  }

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <NotificationBell />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex items-center justify-between gap-3'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Danh mục sản phẩm</h2>
            {!isMobile && (
              <p className='text-muted-foreground'>
                {stats.total} sản phẩm · {stats.categories} nhóm hàng
              </p>
            )}
          </div>
          <AddProductButton />
        </div>

        {/* Summary stats */}
        <div className='grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Sản phẩm</CardTitle>
              <Package className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold tabular-nums'>{stats.total}</div>
              {!isMobile && <p className='text-xs text-muted-foreground'>mặt hàng trong kho</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Nhóm hàng</CardTitle>
              <Tags className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold tabular-nums'>{stats.categories}</div>
              {!isMobile && <p className='text-xs text-muted-foreground'>nhóm đang hoạt động</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Giá vốn</CardTitle>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold tabular-nums'>{formatCurrency(stats.inventoryValue)}</div>
              {!isMobile && <p className='text-xs text-muted-foreground'>giá trị vốn hàng</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Giá TB</CardTitle>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold tabular-nums'>{formatCurrency(stats.avgPrice)}</div>
              {!isMobile && <p className='text-xs text-muted-foreground'>trên mỗi mặt hàng</p>}
            </CardContent>
          </Card>
        </div>

        <ProductsTable onEdit={handleEdit} onDelete={handleDelete} />
      </Main>
      <ProductsDialogs />
    </>
  )
}

export function Products() {
  return (
    <ProductsProvider>
      <ProductsContent />
    </ProductsProvider>
  )
}
