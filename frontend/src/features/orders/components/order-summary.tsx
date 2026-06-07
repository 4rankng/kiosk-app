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
        <span className='text-sm'>Tổng tiền hàng:</span>
        <span className='font-medium'>{formatCurrency(subtotal)}</span>
      </div>
      <div className='flex items-center justify-between gap-4'>
        <span className='text-sm'>Chiết khấu thêm:</span>
        <NumberInput
          value={discount}
          onValueChange={onDiscountChange}
          className='h-9 w-full max-w-[150px]'
        />
      </div>
      <div className='flex items-center justify-between border-t pt-2'>
        <span className='font-semibold'>Khách cần trả:</span>
        <span className='text-xl font-bold'>{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
