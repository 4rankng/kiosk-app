import { useMemo, type FC } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CoinsHand, CoinsStacked01, LayersTwo01, Package, Plus } from '@untitledui/icons'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { NotificationBell } from '@/components/notification-bell'
import { Button } from '@/components/base/buttons/button'
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon'
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
    <Button iconLeading={Plus} onPress={() => setOpen('add')}>
      Thêm
    </Button>
  )
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: FC<{ className?: string }>
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className='rounded-xl bg-primary shadow-xs ring-1 ring-secondary ring-inset'>
      <div className='flex items-start justify-between gap-3 p-4'>
        <div className='min-w-0'>
          <p className='text-sm font-medium text-tertiary'>{label}</p>
          <p className='mt-1 font-heading text-display-sm font-semibold tabular-nums text-primary'>{value}</p>
          {hint && <p className='mt-0.5 text-xs text-quaternary'>{hint}</p>}
        </div>
        <FeaturedIcon icon={icon} color='brand' theme='modern' size='sm' />
      </div>
    </div>
  )
}

function ProductsContent() {
  const { setOpen, setSelectedProduct } = useProductsContext()
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: getProducts })
  const isMobile = useIsMobile()

  const stats = useMemo(() => {
    const categories = new Set(products.map((p) => p.categoryName).filter(Boolean))
    const totalInventoryValue = products.reduce((sum, p) => sum + Number(p.purchasePrice || 0), 0)
    const avgSalePrice = products.length > 0
      ? products.reduce((sum, p) => sum + Number(p.defaultSalePrice || 0), 0) / products.length
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
        <PageHeader
          title='Danh mục sản phẩm'
          description={isMobile ? undefined : `${stats.total} sản phẩm · ${stats.categories} nhóm hàng`}
          actions={<AddProductButton />}
        />

        {/* Summary stats */}
        <div className='grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4'>
          <StatCard
            icon={Package}
            label='Sản phẩm'
            value={String(stats.total)}
            hint={isMobile ? undefined : 'mặt hàng trong kho'}
          />
          <StatCard
            icon={LayersTwo01}
            label='Nhóm hàng'
            value={String(stats.categories)}
            hint={isMobile ? undefined : 'nhóm đang hoạt động'}
          />
          <StatCard
            icon={CoinsStacked01}
            label='Giá vốn'
            value={formatCurrency(stats.inventoryValue)}
            hint={isMobile ? undefined : 'giá trị vốn hàng'}
          />
          <StatCard
            icon={CoinsHand}
            label='Giá TB'
            value={formatCurrency(stats.avgPrice)}
            hint={isMobile ? undefined : 'trên mỗi mặt hàng'}
          />
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
