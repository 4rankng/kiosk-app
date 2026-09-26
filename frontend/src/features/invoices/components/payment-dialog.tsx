import { useId } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { markInvoiceAsPaid } from '@/services/invoices'
import { formatCurrency } from '@/lib/format'
import { toast } from 'sonner'
import { CoinsHand } from '@untitledui/icons'
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal'
import { Button } from '@/components/base/buttons/button'
import { useInvoicesContext } from './invoices-provider'

export function PaymentDialog() {
  const { open, setOpen, selectedInvoice: invoice } = useInvoicesContext()
  const queryClient = useQueryClient()
  const titleId = useId()

  const mutation = useMutation({
    mutationFn: markInvoiceAsPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Đã ghi nhận thanh toán!')
      setOpen(null)
    },
    onError: () => {
      toast.error('Ghi nhận thanh toán thất bại. Vui lòng thử lại.')
    },
  })

  if (!invoice) return null
  const remaining = invoice.total - invoice.paidAmount

  return (
    <ModalOverlay isOpen={open === 'payment'} onOpenChange={(v) => { if (!v) setOpen(null) }}>
      <Modal className='w-full max-w-md'>
        <Dialog aria-labelledby={titleId}>
          {({ close }) => (
            <div className='flex flex-col gap-5 p-5 sm:p-6'>
              <div className='flex flex-col gap-1 text-start'>
                <h2 id={titleId} className='flex items-center gap-2 text-md font-semibold text-primary'>
                  <CoinsHand className='size-5 text-fg-brand-primary' />
                  Thu tiền hóa đơn
                </h2>
                <p className='text-sm text-tertiary'>
                  Hóa đơn {invoice.code} — {invoice.customerName}
                </p>
              </div>
              <div className='rounded-lg bg-secondary p-4'>
                <div className='flex justify-between text-sm'>
                  <span className='text-tertiary'>Tổng tiền</span>
                  <span className='font-medium text-primary'>{formatCurrency(invoice.total)}</span>
                </div>
                <div className='mt-2 flex justify-between border-b border-secondary pb-2 text-sm'>
                  <span className='text-tertiary'>Đã thanh toán</span>
                  <span className='font-medium text-primary'>{formatCurrency(invoice.paidAmount)}</span>
                </div>
                <div className='mt-2 flex justify-between'>
                  <span className='text-tertiary'>Còn lại</span>
                  <span className='text-md font-bold text-primary'>{formatCurrency(remaining)}</span>
                </div>
              </div>
              <div className='flex flex-col-reverse gap-x-2 gap-y-2 sm:flex-row sm:justify-end'>
                <Button color='secondary' onPress={close}>
                  Hủy bỏ
                </Button>
                <Button
                  onPress={() => mutation.mutate(invoice.id)}
                  isLoading={mutation.isPending}
                >
                  {mutation.isPending ? 'Đang xử lý...' : 'Thanh toán toàn bộ'}
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
