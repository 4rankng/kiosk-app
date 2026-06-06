import { useQuery } from '@tanstack/react-query'
import { getBusinessEntities } from '@/services/business-entities'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useInvoicesContext } from './invoices-provider'
import { generateInvoiceHTML } from './invoice-print-document'

export function PrintDialog() {
  const { open, setOpen, selectedInvoice } = useInvoicesContext()
  const { data: entities = [] } = useQuery({
    queryKey: ['business-entities'],
    queryFn: getBusinessEntities,
  })

  function handlePrint(entityId: string) {
    if (!selectedInvoice) return
    const entity = entities.find((e) => e.id === entityId)
    if (!entity) return

    const html = generateInvoiceHTML(selectedInvoice, entity)
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 300)

    setOpen(null)
  }

  return (
    <Dialog open={open === 'print'} onOpenChange={(isOpen) => { if (!isOpen) setOpen(null) }}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Tùy chọn mẫu phiếu in của hộ kinh doanh</DialogTitle>
          <DialogDescription>
            Vui lòng chọn cơ sở kinh doanh làm phần đầu biểu mẫu:
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-3 py-4'>
          {entities.map((entity) => (
            <Button
              key={entity.id}
              variant='outline'
              className='h-auto py-3 text-left justify-start'
              onClick={() => handlePrint(entity.id)}
            >
              <div>
                <div className='font-medium'>{entity.name}</div>
                <div className='text-xs text-muted-foreground mt-1'>{entity.address}</div>
              </div>
            </Button>
          ))}
          {entities.length === 0 && (
            <div className='flex items-center justify-center py-4 text-muted-foreground'>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Đang tải...
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(null)}>
            Hủy bỏ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
