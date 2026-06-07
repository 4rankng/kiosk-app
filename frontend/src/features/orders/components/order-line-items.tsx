import { ShoppingCart } from 'lucide-react'
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
      <div className='flex flex-col items-center justify-center py-8 text-center'>
        <ShoppingCart className='h-10 w-10 text-muted-foreground/40 mb-2' />
        <p className='text-sm text-muted-foreground'>Chưa có sản phẩm nào</p>
        <p className='text-xs text-muted-foreground/60'>Tìm kiếm và thêm hàng hóa ở trên</p>
      </div>
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
