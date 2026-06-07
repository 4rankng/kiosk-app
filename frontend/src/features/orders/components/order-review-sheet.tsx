import type { OrderItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ShoppingCart, Minus, Plus, X } from 'lucide-react'
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
  onRemove,
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
      <SheetContent side='bottom' className='h-[70vh] overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>Chi tiết đơn hàng ({items.length} mặt hàng)</SheetTitle>
        </SheetHeader>

        <div className='mt-4 space-y-4'>
          {items.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <ShoppingCart className='h-10 w-10 text-muted-foreground/40 mb-2' />
              <p className='text-sm text-muted-foreground'>Chưa có sản phẩm nào</p>
              <p className='text-xs text-muted-foreground/60'>Chọn hàng hóa từ danh sách phía dưới</p>
            </div>
          ) : (
            <>
              {/* Line items */}
              <div className='space-y-2'>
                {items.map((item) => (
                  <div key={item.productId} className='flex items-start gap-3 rounded-lg border p-3'>
                    <div className='flex-1 space-y-2'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <span className='text-sm font-medium'>{item.productName}</span>
                          <span className='ml-1 text-xs text-muted-foreground'>({item.unit})</span>
                        </div>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7'
                          onClick={() => onRemove(item.productId)}
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>

                      {/* Quantity stepper */}
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='outline'
                          size='icon'
                          className='h-10 w-10 min-w-[44px]'
                          onClick={() => onUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className='h-4 w-4' />
                        </Button>
                        <span className='w-12 text-center text-lg font-semibold'>{item.quantity}</span>
                        <Button
                          variant='outline'
                          size='icon'
                          className='h-10 w-10 min-w-[44px]'
                          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className='h-4 w-4' />
                        </Button>

                        <span className='mx-2 text-muted-foreground'>·</span>
                        <span className='text-sm text-muted-foreground'>Giá:</span>
                        <Input
                          type='text'
                          inputMode='numeric'
                          value={item.unitPrice.toLocaleString('vi-VN')}
                          onChange={(e) => {
                            const val = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0
                            onUpdatePrice(item.productId, val)
                          }}
                          className='h-9 w-[110px] text-right'
                        />
                      </div>
                    </div>
                  </div>
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

              {/* Submit button */}
              <Button
                size='lg'
                className='w-full min-h-[48px]'
                onClick={onSubmit}
                disabled={isPending}
              >
                {isPending ? 'Đang lưu...' : 'Lưu và tạo hóa đơn'}
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
