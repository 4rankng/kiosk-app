import type { OrderItem } from '@/types'
import { formatCurrency, toNumber } from '@/lib/format'
import { Button } from '@/components/base/buttons/button'
import { NumberInput } from '@/components/number-input'
import { Minus, Plus, X } from '@untitledui/icons'

interface OrderLineItemProps {
  item: OrderItem
  onUpdateQuantity: (productId: string, qty: number) => void
  onUpdatePrice: (productId: string, price: number) => void
  onRemove?: (productId: string) => void
}

/** Header row of a line item: product name (unit) on the left, line total on the right. */
function LineItemHeader({ item }: { item: OrderItem }) {
  return (
    <div className='flex items-center justify-between gap-2'>
      <span className='truncate text-sm font-medium text-primary'>
        {item.productName}
        <span className='ml-1 text-xs text-tertiary'>({item.unit})</span>
      </span>
      <span className='whitespace-nowrap text-sm font-semibold text-brand-secondary tabular-nums'>
        {formatCurrency(item.total)}
      </span>
    </div>
  )
}

export function OrderLineItem({ item, onUpdateQuantity, onUpdatePrice, onRemove }: OrderLineItemProps) {
  return (
    <div className='space-y-2 overflow-hidden rounded-xl bg-primary p-3 ring-1 ring-secondary_alt'>
      <LineItemHeader item={item} />

      <div className='flex items-center gap-1.5'>
        <Button
          color='secondary'
          size='sm'
          iconLeading={Minus}
          className='size-10 sm:size-8 shrink-0 touch-manipulation'
          aria-label='Giảm số lượng'
          onPress={() => onUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))}
        />
        <span className='w-10 shrink-0 text-center text-base sm:text-sm font-semibold tabular-nums' aria-live='polite'>{item.quantity}</span>
        <Button
          color='secondary'
          size='sm'
          iconLeading={Plus}
          className='size-10 sm:size-8 shrink-0 touch-manipulation'
          aria-label='Tăng số lượng'
          onPress={() => onUpdateQuantity(item.productId, item.quantity + 1)}
        />
        {onRemove && (
          <Button
            color='tertiary-destructive'
            size='sm'
            iconLeading={X}
            className='size-10 sm:size-8 shrink-0'
            aria-label='Xóa mặt hàng'
            onPress={() => onRemove(item.productId)}
          />
        )}

        <NumberInput
          value={toNumber(item.unitPrice)}
          onValueChange={(val) => onUpdatePrice(item.productId, val)}
          className='h-10 sm:h-8 w-[95px] sm:w-[90px] shrink-0 text-sm'
        />
      </div>
    </div>
  )
}
