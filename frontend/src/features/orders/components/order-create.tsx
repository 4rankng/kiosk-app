import { useState, useCallback } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { RotateCcw, ShoppingCart, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formatCurrency } from '@/lib/format'
import { createOrder } from '@/services/orders'
import { useIsMobile } from '@/hooks/use-mobile'
import type { OrderItem, Customer } from '@/types'
import { CustomerSelector } from './customer-selector'
import { ProductSearch } from './product-search'
import { POSCategoryGrid } from './pos-category-grid'
import { OrderLineItems } from './order-line-items'
import { OrderSummary } from './order-summary'
import { BusinessEntitySelector } from './business-entity-selector'
import { OrderSuccessDialog } from './order-success-dialog'
import { OrderReviewSheet } from './order-review-sheet'

export function OrderCreate() {
  const queryClient = useQueryClient()

  const isMobile = useIsMobile()

  // Order state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [priceListId, setPriceListId] = useState<string>('')
  const [items, setItems] = useState<OrderItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [businessEntityId, setBusinessEntityId] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdOrderCode, setCreatedOrderCode] = useState('')
  const [reviewOpen, setReviewOpen] = useState(false)

  const subtotal = items.reduce((s, i) => s + i.total, 0)
  const total = subtotal - discount

  const createMutation = useMutation({
    mutationFn: () =>
      createOrder({
        customerId: selectedCustomer!.id,
        customerName: selectedCustomer!.name,
        companyId: selectedCustomer!.companyId,
        date: new Date().toISOString(),
        items,
        subtotal,
        discount,
        total,
        businessEntityId,
        status: 'confirmed',
      }),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      setCreatedOrderCode(order.code)
      setShowSuccess(true)
    },
  })

  const addItem = useCallback(
    (product: { id: string; name: string; unit: string }, price: number) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === product.id)
        if (existing) {
          return prev.map((i) =>
            i.productId === product.id
              ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice }
              : i
          )
        }
        return [
          ...prev,
          {
            productId: product.id,
            productName: product.name,
            unit: product.unit,
            quantity: 1,
            unitPrice: price,
            total: price,
          },
        ]
      })
    },
    []
  )

  const updateItemQuantity = useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity: qty, total: qty * i.unitPrice } : i
      )
    )
  }, [])

  const updateItemPrice = useCallback((productId: string, price: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, unitPrice: price, total: i.quantity * price } : i
      )
    )
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  function handleReset() {
    setSelectedCustomer(null)
    setPriceListId('')
    setItems([])
    setDiscount(0)
    setBusinessEntityId('')
  }

  function handleSubmit() {
    if (!selectedCustomer) {
      toast.error('Vui lòng chọn khách hàng')
      return
    }
    if (items.length === 0) {
      toast.error('Vui lòng thêm ít nhất một sản phẩm')
      return
    }
    if (!businessEntityId) {
      toast.error('Vui lòng chọn cơ sở xuất phiếu')
      return
    }
    createMutation.mutate()
  }

  return (
    <>
      <Header fixed>
        <div className='me-auto flex items-center gap-2'>
          <ShoppingCart className='h-5 w-5' />
          <h2 className='text-2xl font-bold tracking-tight'>Tạo đơn hàng mới</h2>
        </div>
        <Button variant='outline' size='sm' onClick={handleReset}>
          <RotateCcw className='mr-1 h-4 w-4' />
          Làm lại
        </Button>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 pb-24'>
        {/* Section 1: Customer */}
        <section className='space-y-2'>
          <div className='flex items-center gap-2'>
            <span className='flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold'>
              1
            </span>
            <h3 className='text-sm font-semibold uppercase text-muted-foreground tracking-wider'>
              Thông tin người mua
            </h3>
          </div>
          <div className='rounded-lg border bg-card p-4'>
            <CustomerSelector
              selectedCustomer={selectedCustomer}
              onSelect={(customer, plId) => {
                setSelectedCustomer(customer)
                setPriceListId(plId)
              }}
            />
          </div>
        </section>

        {/* Section 2: Cart */}
        <section className='space-y-2'>
          <div className='flex items-center gap-2'>
            <span className='flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold'>
              2
            </span>
            <h3 className='text-sm font-semibold uppercase text-muted-foreground tracking-wider'>
              Giỏ hàng
            </h3>
          </div>
          <div className='rounded-lg border bg-card p-4 space-y-3'>
            {isMobile ? (
              <POSCategoryGrid
                priceListId={priceListId}
                onAddProduct={addItem}
              />
            ) : (
              <>
                <ProductSearch
                  priceListId={priceListId}
                  onAddProduct={addItem}
                />
                <OrderLineItems
                  items={items}
                  onUpdateQuantity={updateItemQuantity}
                  onUpdatePrice={updateItemPrice}
                  onRemove={removeItem}
                />
              </>
            )}
          </div>
        </section>

        {/* Section 3: Summary — hidden on mobile (shown in review sheet) */}
        {!isMobile && (
          <section className='space-y-2'>
            <div className='flex items-center gap-2'>
              <span className='flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold'>
                3
              </span>
              <h3 className='text-sm font-semibold uppercase text-muted-foreground tracking-wider'>
                Tổng kết và thanh toán
              </h3>
            </div>
            <div className='rounded-lg border bg-card p-4 space-y-3'>
              <OrderSummary
                subtotal={subtotal}
                discount={discount}
                total={total}
                onDiscountChange={setDiscount}
              />
              <BusinessEntitySelector
                selected={businessEntityId}
                onSelect={setBusinessEntityId}
              />
            </div>
          </section>
        )}
      </Main>

      {/* Sticky bottom bar */}
      {isMobile ? (
        <Button
          type='button'
          variant='ghost'
          onClick={() => setReviewOpen(true)}
          className='fixed bottom-0 left-0 right-0 z-40 h-auto border-t bg-background/80 backdrop-blur-lg p-4 rounded-none'
        >
          <div className='flex w-full items-center justify-between'>
            <div>
              <span className='text-sm text-muted-foreground'>
                {items.length} mặt hàng · Khách cần trả:
              </span>
              <span className='ml-2 text-xl font-bold'>{formatCurrency(total)}</span>
            </div>
            <ChevronUp className='h-5 w-5 text-muted-foreground' />
          </div>
        </Button>
      ) : (
        <div className='fixed bottom-0 left-0 right-0 z-40 border-t bg-background/80 backdrop-blur-lg shadow-lg p-4 sm:left-[calc(var(--sidebar-width,0px)+0px)]'>
          <div className='mx-auto flex max-w-2xl items-center justify-between gap-4'>
            <div>
              <span className='text-sm text-muted-foreground'>Khách cần trả:</span>
              <span className='ml-2 text-2xl font-bold'>{formatCurrency(total)}</span>
            </div>
            <Button
              size='lg'
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className='min-w-[200px]'
            >
              {createMutation.isPending ? 'Đang lưu...' : 'Lưu và tạo hóa đơn'}
            </Button>
          </div>
        </div>
      )}

      {/* Mobile order review sheet */}
      <OrderReviewSheet
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        items={items}
        onUpdateQuantity={updateItemQuantity}
        onUpdatePrice={updateItemPrice}
        onRemove={removeItem}
        onSubmit={handleSubmit}
        subtotal={subtotal}
        discount={discount}
        total={total}
        onDiscountChange={setDiscount}
        businessEntityId={businessEntityId}
        onBusinessEntitySelect={setBusinessEntityId}
        isPending={createMutation.isPending}
      />

      <OrderSuccessDialog
        open={showSuccess}
        onOpenChange={setShowSuccess}
        orderCode={createdOrderCode}
        customerName={selectedCustomer?.name ?? ''}
        total={total}
      />
    </>
  )
}
