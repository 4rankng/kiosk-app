import { ShoppingCart01 } from '@untitledui/icons'
import type { OrderItem } from '@/types'
import { EmptyState } from '@/components/empty-state'
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
      <EmptyState
        variant='empty'
        title='Chưa có sản phẩm nào'
        description='Tìm kiếm và thêm hàng hóa ở trên'
        icon={<ShoppingCart01 className='size-6 text-quaternary' />}
      />
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
