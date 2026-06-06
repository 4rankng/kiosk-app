import { useQueryClient } from '@tanstack/react-query'
import { deleteProduct } from '@/services/products'
import { useProductsContext } from './products-provider'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { toast } from 'sonner'

export function ProductDeleteDialog() {
  const { open, setOpen, selectedProduct } = useProductsContext()
  const queryClient = useQueryClient()

  return (
    <ConfirmDialog
      open={open === 'delete'}
      onOpenChange={() => setOpen(null)}
      title='Xóa sản phẩm'
      desc='Bạn có chắc muốn xóa sản phẩm này? Hành động này không thể hoàn tác.'
      confirmText='Xóa'
      destructive
      handleConfirm={() => {
        if (!selectedProduct) return
        deleteProduct(selectedProduct.id).then(() => {
          queryClient.invalidateQueries({ queryKey: ['products'] })
          setOpen(null)
          toast.success('Xóa sản phẩm thành công!')
        })
      }}
    />
  )
}
