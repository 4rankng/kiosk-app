import { useEffect } from 'react'
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

  // Reset form when dialog opens with new company data
  useEffect(() => {
    if (open === 'edit' && selectedCompany) {
      form.reset({
        name: selectedCompany.name ?? '',
        taxId: selectedCompany.taxId ?? '',
        priceListId: selectedCompany.priceListId ?? '',
      })
    } else if (open === 'add') {
      form.reset({ name: '', taxId: '', priceListId: '' })
    }
  }, [open, selectedCompany])

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
        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v as CompanySchema))} className='flex flex-1 flex-col gap-4'>
          <div className='flex-1 space-y-4 overflow-y-auto'>
            <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-2'>
              <Label>Tên công ty</Label>
              <Input {...form.register('name')} />
              {form.formState.errors.name && <p className='text-sm text-destructive'>{form.formState.errors.name.message}</p>}
            </div>
            <div className='space-y-2'>
              <Label>MST</Label>
              <Input {...form.register('taxId')} />
            </div>
          </div>
            <div className='space-y-2'>
              <Label>Bảng giá</Label>
              <Select onValueChange={(v) => form.setValue('priceListId', v)} value={form.watch('priceListId') ?? ''}>
                <SelectTrigger><SelectValue placeholder='Chọn bảng giá...' /></SelectTrigger>
                <SelectContent>
                  {priceLists.map((pl) => <SelectItem key={pl.id} value={pl.id}>{pl.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className='border-t pt-4'>
            <Button type='button' variant='outline' onClick={() => setOpen(null)}>Hủy bỏ</Button>
            <Button type='submit' disabled={mutation.isPending}>{mutation.isPending ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
