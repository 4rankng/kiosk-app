import { useQuery } from '@tanstack/react-query'
import { getBusinessEntities } from '@/services/business-entities'
import { getInvoiceById } from '@/services/invoices'
import { useId } from 'react'
import { RefreshCw01 } from '@untitledui/icons'
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal'
import { Button } from '@/components/base/buttons/button'
import { useInvoicesContext } from './invoices-provider'
import { generateInvoiceHTML } from './invoice-print-document'

export function PrintDialog() {
  const { open, setOpen, selectedInvoice } = useInvoicesContext()
  const titleId = useId()
  const { data: entities = [] } = useQuery({
    queryKey: ['business-entities'],
    queryFn: () => getBusinessEntities(),
  })

  async function handlePrint(entityId: string) {
    if (!selectedInvoice) return
    const entity = entities.find((e) => e.id === entityId)
    if (!entity) return

    const detail = await getInvoiceById(selectedInvoice.id)
    const html = generateInvoiceHTML(detail, entity)
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()

    // Wait for the new window's document to fully load before invoking print,
    // otherwise the browser may print a blank page (race with document parsing).
    const triggerPrint = () => {
      try {
        printWindow.focus()
        printWindow.print()
      } catch {
        // If print() throws (e.g. blocked), ignore silently.
      }
      setOpen(null)
    }

    if (printWindow.document.readyState === 'complete') {
      triggerPrint()
    } else {
      printWindow.onload = triggerPrint
      // Safety net: in some browsers onload never fires for about:blank writes,
      // so poll readyState for a short window.
      let polls = 0
      const poll = setInterval(() => {
        polls += 1
        if (printWindow.document.readyState === 'complete' || polls > 20) {
          clearInterval(poll)
          triggerPrint()
        }
      }, 50)
    }
  }

  return (
    <ModalOverlay isOpen={open === 'print'} onOpenChange={(isOpen) => { if (!isOpen) setOpen(null) }}>
      <Modal className='w-full max-w-md'>
        <Dialog aria-labelledby={titleId}>
          {({ close }) => (
            <div className='flex flex-col gap-5 p-5 sm:p-6'>
              <div className='flex flex-col gap-1 text-start'>
                <h2 id={titleId} className='text-md font-semibold text-primary'>
                  Tùy chọn mẫu phiếu in của hộ kinh doanh
                </h2>
                <p className='text-sm text-tertiary'>
                  Vui lòng chọn cơ sở kinh doanh làm phần đầu biểu mẫu:
                </p>
              </div>
              <div className='grid gap-3'>
                {entities.map((entity) => (
                  <Button
                    key={entity.id}
                    color='secondary'
                    className='w-full py-2.5'
                    onPress={() => handlePrint(entity.id)}
                  >
                    <span className='flex flex-col items-start gap-0.5 text-start'>
                      <span className='font-medium text-primary'>{entity.name}</span>
                      <span className='text-xs text-tertiary'>{entity.address}</span>
                    </span>
                  </Button>
                ))}
                {entities.length === 0 && (
                  <div className='flex items-center justify-center gap-2 py-4 text-tertiary'>
                    <RefreshCw01 className='size-4 animate-spin' />
                    Đang tải...
                  </div>
                )}
              </div>
              <div className='flex flex-col-reverse gap-x-2 gap-y-2 sm:flex-row sm:justify-end'>
                <Button color='secondary' onPress={close}>
                  Hủy bỏ
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
