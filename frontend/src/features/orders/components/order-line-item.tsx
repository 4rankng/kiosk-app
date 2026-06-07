import type { OrderItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Minus, Plus, X } from 'lucide-react'

interface OrderLineItemProps {
  item: OrderItem
  onUpdateQuantity: (productId: string, qty: number) => void
  onUpdatePrice: (productId: string, price: number) => void
  onRemove: (productId: string) => void
}

export function OrderLineItem({ item, onUpdateQuantity, onUpdatePrice, onRemove }: OrderLineItemProps) {
  return (
    <div className='flex items-start gap-3 rounded-lg border p-3'>
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
  )
}
