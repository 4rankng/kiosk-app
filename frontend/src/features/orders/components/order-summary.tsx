import { formatCurrency } from '@/lib/format'
import { Input } from '@/components/ui/input'

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
        <Input
          type='text'
          inputMode='numeric'
          value={discount.toLocaleString('vi-VN')}
          onChange={(e) => {
            const val = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0
            onDiscountChange(val)
          }}
          className='h-9 w-full max-w-[150px] text-right'
        />
      </div>
      <div className='flex items-center justify-between border-t pt-2'>
        <span className='font-semibold'>Khách cần trả:</span>
        <span className='text-xl font-bold'>{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
