import { formatCurrency } from '@/lib/format'
import { NumberInput } from '@/components/number-input'

interface OrderSummaryProps {
  subtotal: number
  discount: number
  total: number
  onDiscountChange: (discount: number) => void
}

export function OrderSummary({ subtotal, discount, total, onDiscountChange }: OrderSummaryProps) {
  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <span className='text-sm text-secondary'>Tổng tiền hàng:</span>
        <span className='font-medium text-primary'>{formatCurrency(subtotal)}</span>
      </div>
      <div className='flex items-center justify-between gap-4'>
        <span className='text-sm whitespace-nowrap text-secondary'>Chiết khấu thêm:</span>
        <NumberInput
          value={discount}
          onValueChange={onDiscountChange}
          className='w-full max-w-[150px] shrink-0'
        />
      </div>
      <div className='flex items-center justify-between border-t border-secondary pt-2'>
        <span className='text-sm font-semibold text-primary'>Khách cần trả:</span>
        <span className='text-lg font-bold text-primary tabular-nums'>
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  )
}
