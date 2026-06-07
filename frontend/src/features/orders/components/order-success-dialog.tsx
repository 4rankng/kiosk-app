import { formatCurrency } from '@/lib/format'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

interface OrderSuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderCode: string
  customerName: string
  total: number
}

export function OrderSuccessDialog({
  open,
  onOpenChange,
  orderCode,
  customerName,
  total,
}: OrderSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
            <CheckCircle2 className='h-10 w-10 text-primary' />
          </div>
          <DialogTitle className='text-center text-xl'>
            Tạo đơn hàng thành công!
          </DialogTitle>
          <DialogDescription className='text-center'>
            Đơn hàng đã được lưu vào hệ thống.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-2 rounded-xl bg-muted/50 p-4'>
          <div className='flex justify-between text-sm'>
            <span className='text-muted-foreground'>Mã đơn hàng:</span>
            <span className='font-mono font-medium'>{orderCode}</span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-muted-foreground'>Khách hàng:</span>
            <span className='font-medium'>{customerName}</span>
          </div>
          <div className='flex justify-between border-t pt-2'>
            <span className='text-muted-foreground'>Tổng tiền:</span>
            <span className='text-xl font-bold'>{formatCurrency(total)}</span>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
