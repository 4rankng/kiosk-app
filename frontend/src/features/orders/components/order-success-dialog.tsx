import { useId } from 'react'
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal'
import { Button } from '@/components/base/buttons/button'
import { CheckCircle } from '@untitledui/icons'
import { formatCurrency } from '@/lib/format'

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
  const titleId = useId()

  return (
    <ModalOverlay isOpen={open} onOpenChange={onOpenChange}>
      <Modal className='w-full max-w-md'>
        <Dialog aria-labelledby={titleId}>
          {() => (
            <div className='flex flex-col items-center gap-5 p-5 text-center sm:p-6'>
              <div className='flex size-16 items-center justify-center rounded-full bg-success-secondary'>
                <CheckCircle className='size-8 text-fg-success-primary' />
              </div>
              <div className='flex flex-col gap-1'>
                <h2 id={titleId} className='text-md font-semibold text-primary'>
                  Tạo đơn hàng thành công!
                </h2>
                <p className='text-sm text-tertiary'>
                  Đơn hàng đã được lưu vào hệ thống.
                </p>
              </div>
              <div className='w-full space-y-2 rounded-xl bg-secondary p-4'>
                <div className='flex justify-between text-sm'>
                  <span className='text-tertiary'>Mã đơn hàng:</span>
                  <span className='font-mono font-medium text-primary'>{orderCode}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-tertiary'>Khách hàng:</span>
                  <span className='font-medium text-primary'>{customerName}</span>
                </div>
                <div className='flex justify-between border-t border-secondary pt-2'>
                  <span className='text-tertiary'>Tổng tiền:</span>
                  <span className='text-lg font-bold text-primary tabular-nums'>
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
              <Button onPress={() => onOpenChange(false)}>Đóng</Button>
            </div>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
