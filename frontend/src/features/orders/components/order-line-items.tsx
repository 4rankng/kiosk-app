import type { OrderItem } from '@/types'
import { OrderLineItem } from './order-line-item'

interface OrderLineItemsProps {
  items: OrderItem[]
  onUpdateQuantity: (productId: string, qty: number) => void
  onUpdatePrice: (productId: string, price: number) => void
  onRemove: (productId: string) => void
}

export function OrderLineItems({
  items,
  onUpdateQuantity,
  onUpdatePrice,
  onRemove,
}: OrderLineItemsProps) {
  if (items.length === 0) {
    return (
      <p className='py-4 text-center text-sm text-muted-foreground'>
        Chưa có sản phẩm nào. Tìm kiếm và thêm hàng hóa ở trên.
      </p>
    )
  }

  return (
    <div className='space-y-2'>
      {items.map((item) => (
        <OrderLineItem
          key={item.productId}
          item={item}
          onUpdateQuantity={onUpdateQuantity}
          onUpdatePrice={onUpdatePrice}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}
