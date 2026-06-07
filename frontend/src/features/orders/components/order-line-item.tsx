import type { OrderItem } from '@/types'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { NumberInput } from '@/components/number-input'
import { Minus, Plus, X } from 'lucide-react'

interface OrderLineItemProps {
  item: OrderItem
  onUpdateQuantity: (productId: string, qty: number) => void
  onUpdatePrice: (productId: string, price: number) => void
  onRemove?: (productId: string) => void
}

export function OrderLineItem({ item, onUpdateQuantity, onUpdatePrice, onRemove }: OrderLineItemProps) {
  return (
    <div className='rounded-lg border p-3 space-y-2 overflow-hidden'>
      <div className='flex items-center justify-between gap-2'>
        <span className='text-sm font-medium truncate'>
          {item.productName}
          <span className='ml-1 text-xs text-muted-foreground'>({item.unit})</span>
        </span>
        <span className='whitespace-nowrap text-sm font-semibold text-primary tabular-nums'>
          {formatCurrency(item.total)}
        </span>
      </div>

      <div className='flex items-center gap-1.5'>
        <Button
          variant='outline'
          size='icon'
          className='h-9 w-9 shrink-0'
          onClick={() => onUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))}
        >
          <Minus className='h-4 w-4' />
        </Button>
        <span className='w-10 shrink-0 text-center text-lg font-semibold tabular-nums'>{item.quantity}</span>
        <Button
          variant='outline'
          size='icon'
          className='h-9 w-9 shrink-0'
          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
        >
          <Plus className='h-4 w-4' />
        </Button>

        {onRemove && (
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive'
            onClick={() => onRemove(item.productId)}
          >
            <X className='h-4 w-4' />
          </Button>
        )}

        <NumberInput
          value={item.unitPrice}
          onValueChange={(val) => onUpdatePrice(item.productId, val)}
          className='h-8 w-[90px] shrink-0'
        />
      </div>
    </div>
  )
}
