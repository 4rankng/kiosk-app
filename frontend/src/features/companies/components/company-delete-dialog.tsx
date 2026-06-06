import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteCompany } from '@/services/companies'
import { useCompaniesContext } from './companies-provider'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

export function CompanyDeleteDialog() {
  const { open, setOpen, selectedCompany } = useCompaniesContext()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteCompany(selectedCompany!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      setOpen(null)
      toast.success('Xóa công ty thành công!')
    },
  })

  return (
    <AlertDialog open={open === 'delete'} onOpenChange={() => setOpen(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn xóa công ty <strong>{selectedCompany?.name}</strong>? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Đang xóa...' : 'Xóa'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
