import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { NotificationBell } from '@/components/notification-bell'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ProductsDialogs } from './components/products-dialogs'
import { ProductsProvider, useProductsContext } from './components/products-provider'
import { ProductsTable } from './components/products-table'
import type { Product } from '@/types'

function AddProductButton() {
  const { setOpen } = useProductsContext()
  return (
    <Button onClick={() => setOpen('add')}>
      <Plus className='mr-2 h-4 w-4' />
      Thêm sản phẩm
    </Button>
  )
}

function ProductsContent() {
  const { setOpen, setSelectedProduct } = useProductsContext()

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
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Danh mục sản phẩm</h2>
            <p className='text-muted-foreground'>Quản lý sản phẩm và tồn kho.</p>
          </div>
          <AddProductButton />
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
