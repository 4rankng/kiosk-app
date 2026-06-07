import type { OrderItem } from '@/types'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ShoppingCart } from 'lucide-react'
import { OrderLineItem } from './order-line-item'
import { OrderSummary } from './order-summary'
import { BusinessEntitySelector } from './business-entity-selector'

interface OrderReviewSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: OrderItem[]
  onUpdateQuantity: (productId: string, qty: number) => void
  onUpdatePrice: (productId: string, price: number) => void
  onRemove: (productId: string) => void
  onSubmit: () => void
  subtotal: number
  discount: number
  total: number
  onDiscountChange: (val: number) => void
  businessEntityId: string
  onBusinessEntitySelect: (id: string) => void
  isPending: boolean
}

export function OrderReviewSheet({
  open,
  onOpenChange,
  items,
  onUpdateQuantity,
  onUpdatePrice,
  onSubmit,
  subtotal,
  discount,
  total,
  onDiscountChange,
  businessEntityId,
  onBusinessEntitySelect,
  isPending,
}: OrderReviewSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='bottom' className='flex flex-col p-0 [&>button]:hidden'>
        <SheetHeader className='px-4 pt-4 pb-0'>
          <SheetTitle className='flex items-center justify-between'>
            <span className='flex items-center gap-2'>
              <ShoppingCart className='h-5 w-5' />
              {items.length} mặt hàng
            </span>
            <span>{formatCurrency(total)}</span>
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable content */}
        <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4'>
          {items.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <ShoppingCart className='h-10 w-10 text-muted-foreground/40 mb-2' />
              <p className='text-sm text-muted-foreground'>Chưa có sản phẩm nào</p>
              <p className='text-xs text-muted-foreground/60'>Chọn hàng hóa từ danh sách phía dưới</p>
            </div>
          ) : (
            <>
              {/* Line items — no remove button in review */}
              <div className='space-y-2'>
                {items.map((item) => (
                  <OrderLineItem
                    key={item.productId}
                    item={item}
                    onUpdateQuantity={onUpdateQuantity}
                    onUpdatePrice={onUpdatePrice}
                  />
                ))}
              </div>

              {/* Summary */}
              <div className='rounded-lg border bg-card p-4'>
                <OrderSummary
                  subtotal={subtotal}
                  discount={discount}
                  total={total}
                  onDiscountChange={onDiscountChange}
                />
              </div>

              {/* Business entity selector */}
              <div className='rounded-lg border bg-card p-4'>
                <BusinessEntitySelector
                  selected={businessEntityId}
                  onSelect={onBusinessEntitySelect}
                />
              </div>
            </>
          )}
        </div>

        {/* Sticky bottom buttons */}
        <div className='border-t bg-background px-4 py-3 space-y-2'>
          <Button
            size='lg'
            className='w-full min-h-[48px]'
            onClick={onSubmit}
            disabled={isPending}
          >
            {isPending ? 'Đang lưu...' : 'Tạo hóa đơn'}
          </Button>
          <Button
            variant='outline'
            className='w-full min-h-[44px]'
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
