import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteCompany } from '@/services/companies'
import { useCompaniesContext } from './companies-provider'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { toast } from 'sonner'

export function CompanyDeleteDialog() {
  const { open, setOpen, selectedCompany } = useCompaniesContext()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => {
      if (!selectedCompany) throw new Error('Chưa chọn công ty')
      return deleteCompany(selectedCompany.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      setOpen(null)
      toast.success('Xóa công ty thành công!')
    },
  })

  return (
    <ConfirmDialog
      open={open === 'delete'}
      onOpenChange={() => setOpen(null)}
      title='Xác nhận xóa'
      desc={
        <>
          Bạn có chắc muốn xóa công ty <strong>{selectedCompany?.name}</strong>? Hành động này không thể hoàn tác.
        </>
      }
      confirmText={mutation.isPending ? 'Đang xóa...' : 'Xóa'}
      destructive
      isLoading={mutation.isPending}
      handleConfirm={() => mutation.mutate()}
    />
  )
}
