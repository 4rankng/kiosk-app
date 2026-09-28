import { useState, useCallback } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { Button } from '@/components/base/buttons/button'
import { ShoppingCart01, ChevronUp } from '@untitledui/icons'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formatCurrency } from '@/lib/format'
import { createOrder } from '@/services/orders'
import { useIsMobile } from '@/hooks/use-mobile'
import type { OrderItem, Customer } from '@/types'
import { CustomerSelector, useCustomerReferenceData } from './customer-selector'
import { ProductSearch } from './product-search'
import { POSCategoryGrid } from './pos-category-grid'
import { OrderLineItems } from './order-line-items'
import { OrderSummary } from './order-summary'
import { BusinessEntitySelector } from './business-entity-selector'
import { OrderSuccessDialog } from './order-success-dialog'
import { OrderReviewSheet } from './order-review-sheet'
import { OrderSection, OrderSectionCard } from './order-section'

export function OrderCreate() {
  useDocumentTitle('Tạo đơn hàng mới')
  const queryClient = useQueryClient()

  const isMobile = useIsMobile()

  // Order state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  // Derived from the customer's company query — never captured at selection
  // time, so the first selection prices from the customer's price list.
  const { company, priceList } = useCustomerReferenceData(selectedCustomer?.companyId)
  const priceListId = priceList?.id ?? ''
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
        businessEntityId,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        discount,
      }),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
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
          <ShoppingCart01 className='size-5 text-brand-secondary' />
          <h1 className='font-heading text-display-xs font-semibold tracking-tight text-primary'>
            Tạo đơn hàng mới
          </h1>
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 pb-20'>
        {isMobile ? (
          <div className='flex flex-col gap-4'>
            {/* Section 1: Customer */}
            <OrderSection step={1} title='Thông tin người mua' isComplete={!!selectedCustomer}>
              <OrderSectionCard>
                <CustomerSelector
                  selectedCustomer={selectedCustomer}
                  company={company}
                  priceList={priceList}
                  onSelect={setSelectedCustomer}
                />
              </OrderSectionCard>
            </OrderSection>

            {/* Section 2: Cart */}
            <OrderSection step={2} title='Giỏ hàng' isComplete={items.length > 0}>
              <OrderSectionCard spaced>
                <ProductSearch
                  priceListId={priceListId}
                  onAddProduct={addItem}
                />
                <POSCategoryGrid
                  priceListId={priceListId}
                  onAddProduct={addItem}
                />
              </OrderSectionCard>
            </OrderSection>
          </div>
        ) : (
          <div className='grid grid-cols-12 items-start gap-6'>
            {/* Step order matches the mobile flow: pick the customer first, then
                build the cart. The badge numbers describe the order of work, so
                they must not change with the breakpoint. The cart stays the wide
                column because it is the main interaction surface. */}
            <div className='col-span-12 space-y-4 lg:col-span-5 lg:sticky lg:top-20 xl:col-span-4'>
              <OrderSection step={1} title='Khách hàng & Bảng giá' isComplete={!!selectedCustomer}>
                <OrderSectionCard>
                  <CustomerSelector
                    selectedCustomer={selectedCustomer}
                    company={company}
                    priceList={priceList}
                    onSelect={setSelectedCustomer}
                  />
                </OrderSectionCard>
              </OrderSection>
            </div>

            <div className='col-span-12 space-y-4 lg:col-span-7 xl:col-span-8'>
              {/* Product search & Cart line items */}
              <OrderSection
                step={2}
                title='Sản phẩm & Giỏ hàng'
                note={`${items.length} mặt hàng đã chọn`}
                isComplete={items.length > 0}
              >
                <OrderSectionCard spaced>
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
                </OrderSectionCard>
              </OrderSection>

              {/* Order Totals & Business Entity */}
              <OrderSection step={3} title='Tổng kết & Thanh toán'>
                <OrderSectionCard spaced>
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
                  <Button
                    size='lg'
                    onPress={handleSubmit}
                    isDisabled={createMutation.isPending}
                    className='w-full min-h-11 font-semibold shadow-xs'
                  >
                    {createMutation.isPending ? 'Đang lưu...' : 'Lưu và tạo hóa đơn'}
                  </Button>
                </OrderSectionCard>
              </OrderSection>
            </div>
          </div>
        )}
      </Main>

      {/* Mobile sticky bottom bar */}
      {isMobile && (
        <Button
          type='button'
          color='tertiary'
          onPress={() => setReviewOpen(true)}
          className='fixed bottom-0 left-0 right-0 z-40 min-h-11 rounded-none border-t border-secondary bg-primary px-4 py-3'
        >
          <div className='flex w-full items-center justify-between'>
            <div className='flex items-baseline gap-2'>
              <span className='text-sm text-tertiary'>
                {items.length} mặt hàng · Khách cần trả:
              </span>
              <span className='text-lg font-bold text-primary tabular-nums'>
                {formatCurrency(total)}
              </span>
            </div>
            <ChevronUp className='size-5 text-quaternary' />
          </div>
        </Button>
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
