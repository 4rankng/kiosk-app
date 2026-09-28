import type { OrderItem } from '@/types'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/base/buttons/button'
import { SlideoutMenu } from '@/components/application/slideout-menus/slideout-menu'
import { ShoppingCart01 } from '@untitledui/icons'
import { EmptyState } from '@/components/empty-state'
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
    // Layout overrides for the shared slideout, passed as props so the vendor
    // component stays untouched (see the landing rule in AGENTS.md):
    //  - `z-50` lifts the sheet above the app's fixed header and the mobile total
    //    bar, which are both z-40. The vendor overlay declares no z-index at all
    //    and only won by DOM order, which loses to a positioned z-40 sibling —
    //    so the header painted over the sheet header and the total bar covered
    //    the "Đóng" button.
    //  - `pl-0 md:pl-6` cancels the vendor's `pl-6 md:pl-10`, which left a
    //    24px strip of the page showing on the left of a 390px viewport.
    //  - `h-auto` on the content beats the vendor's `size-full`; a full-height
    //    content column inside the flex dialog pushed the footer off-screen.
    <SlideoutMenu
      isOpen={open}
      onOpenChange={onOpenChange}
      className='z-50 pl-0 md:pl-6'
      dialogClassName='gap-4'
    >
      <SlideoutMenu.Header onClose={() => onOpenChange(false)}>
        <div className='flex w-full items-center justify-between gap-3 pr-8'>
          <span className='flex min-w-0 items-center gap-2 text-md font-semibold text-primary'>
            <ShoppingCart01 className='size-5 shrink-0 text-brand-secondary' />
            <span className='truncate'>{items.length} mặt hàng</span>
          </span>
          <span className='shrink-0 text-md font-semibold text-primary tabular-nums'>
            {formatCurrency(total)}
          </span>
        </div>
      </SlideoutMenu.Header>

      <SlideoutMenu.Content className='h-auto min-h-0 flex-1'>
        <div className='space-y-4'>
          {items.length === 0 ? (
            <EmptyState
              variant='empty'
              title='Chưa có sản phẩm nào'
              description='Chọn hàng hóa từ danh sách phía dưới'
              icon={<ShoppingCart01 className='size-6 text-quaternary' />}
            />
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
              <div className='rounded-xl bg-secondary p-4'>
                <OrderSummary
                  subtotal={subtotal}
                  discount={discount}
                  total={total}
                  onDiscountChange={onDiscountChange}
                />
              </div>

              {/* Business entity selector */}
              <div className='rounded-xl bg-secondary p-4'>
                <BusinessEntitySelector
                  selected={businessEntityId}
                  onSelect={onBusinessEntitySelect}
                />
              </div>
            </>
          )}
        </div>
      </SlideoutMenu.Content>

      <SlideoutMenu.Footer className='space-y-2'>
        <Button
          size='lg'
          className='w-full min-h-11'
          onPress={onSubmit}
          isDisabled={isPending}
        >
          {isPending ? 'Đang lưu...' : 'Tạo hóa đơn'}
        </Button>
        <Button
          size='lg'
          color='secondary'
          className='w-full min-h-11'
          onPress={() => onOpenChange(false)}
        >
          Đóng
        </Button>
      </SlideoutMenu.Footer>
    </SlideoutMenu>
  )
}
