import { deleteCustomer } from '@/services/customers'
import { useCustomersContext } from './customers-provider'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function CustomerDeleteDialog() {
  const { open, setOpen, selectedCustomer } = useCustomersContext()
  const queryClient = useQueryClient()

  return (
    <ConfirmDialog
      open={open === 'delete'}
      onOpenChange={() => setOpen(null)}
      title='Xóa khách hàng'
      desc='Bạn có chắc muốn xóa khách hàng này? Hành động này không thể hoàn tác.'
      confirmText='Xóa'
      destructive
      handleConfirm={() => {
        if (!selectedCustomer) return
        deleteCustomer(selectedCustomer.id).then(() => {
          queryClient.invalidateQueries({ queryKey: ['customers'] })
          setOpen(null)
          toast.success('Xóa khách hàng thành công!')
        })
      }}
    />
  )
}
