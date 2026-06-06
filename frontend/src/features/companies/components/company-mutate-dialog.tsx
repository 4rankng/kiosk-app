import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { createCompany, updateCompany } from '@/services/companies'
import { getPriceLists } from '@/services/price-lists'
import { companySchema, type CompanySchema } from '../data/schema'
import { useCompaniesContext } from './companies-provider'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export function CompanyMutateDialog() {
  const { open, setOpen, selectedCompany } = useCompaniesContext()
  const queryClient = useQueryClient()
  const isEdit = open === 'edit'
  const { data: priceLists = [] } = useQuery({ queryKey: ['price-lists'], queryFn: getPriceLists })

  const form = useForm<CompanySchema>({
    resolver: zodResolver(companySchema),
    defaultValues: isEdit
      ? { name: selectedCompany?.name ?? '', taxId: selectedCompany?.taxId ?? '', priceListId: selectedCompany?.priceListId ?? '' }
      : { name: '', taxId: '', priceListId: '' },
  })

  const mutation = useMutation({
    mutationFn: (values: CompanySchema) =>
      isEdit && selectedCompany ? updateCompany(selectedCompany.id, values) : createCompany(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      setOpen(null)
      toast.success(isEdit ? 'Cập nhật công ty thành công!' : 'Thêm công ty thành công!')
    },
  })

  return (
    <Dialog open={open === 'add' || open === 'edit'} onOpenChange={() => setOpen(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa công ty' : 'Thêm công ty/chuỗi mới'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Cập nhật thông tin công ty.' : 'Nhập thông tin để tạo công ty mới.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v as CompanySchema))} className='space-y-4'>
          <div className='space-y-2'>
            <Label>Tên công ty/chuỗi</Label>
            <Input {...form.register('name')} />
            {form.formState.errors.name && <p className='text-sm text-destructive'>{form.formState.errors.name.message}</p>}
          </div>
          <div className='space-y-2'>
            <Label>Mã số thuế</Label>
            <Input {...form.register('taxId')} />
          </div>
          <div className='space-y-2'>
            <Label>Bảng giá áp dụng</Label>
            <Select onValueChange={(v) => form.setValue('priceListId', v)} defaultValue={form.getValues('priceListId')}>
              <SelectTrigger><SelectValue placeholder='Chọn bảng giá...' /></SelectTrigger>
              <SelectContent>
                {priceLists.map((pl) => <SelectItem key={pl.id} value={pl.id}>{pl.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setOpen(null)}>Hủy bỏ</Button>
            <Button type='submit' disabled={mutation.isPending}>{mutation.isPending ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
