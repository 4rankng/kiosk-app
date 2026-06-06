import { useMutation, useQueryClient } from '@tanstack/react-query'
import { markInvoiceAsPaid } from '@/services/invoices'
import { formatCurrency } from '@/lib/format'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useInvoicesContext } from './invoices-provider'

export function PaymentDialog() {
  const { open, setOpen, selectedInvoice: invoice } = useInvoicesContext()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: markInvoiceAsPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Đã ghi nhận thanh toán!')
      setOpen(null)
    },
  })

  if (!invoice) return null
  const remaining = invoice.total - invoice.paidAmount

  return (
    <Dialog open={open === 'payment'} onOpenChange={(v) => { if (!v) setOpen(null) }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thu tiền hóa đơn</DialogTitle>
          <DialogDescription>
            Hóa đơn {invoice.code} — {invoice.customerName}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-3 py-4'>
          <div className='flex justify-between text-sm'>
            <span className='text-muted-foreground'>Tổng tiền</span>
            <span className='font-medium'>{formatCurrency(invoice.total)}</span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-muted-foreground'>Đã thanh toán</span>
            <span className='font-medium'>{formatCurrency(invoice.paidAmount)}</span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-muted-foreground'>Còn lại</span>
            <span className='font-medium text-orange-600'>{formatCurrency(remaining)}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(null)}>Hủy bỏ</Button>
          <Button onClick={() => mutation.mutate(invoice.id)} disabled={mutation.isPending}>
            {mutation.isPending ? 'Đang xử lý...' : 'Thanh toán toàn bộ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
