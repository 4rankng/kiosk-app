import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { createCustomer, updateCustomer } from '@/services/customers'
import { getCompanies } from '@/services/companies'
import { customerSchema, type CustomerSchema } from '../data/schema'
import { useCustomersContext } from './customers-provider'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export function CustomerMutateDialog() {
  const { open, setOpen, selectedCustomer } = useCustomersContext()
  const queryClient = useQueryClient()
  const isEdit = open === 'edit'
  const { data: companies = [] } = useQuery({ queryKey: ['companies'], queryFn: getCompanies })

  const form = useForm<CustomerSchema>({
    resolver: zodResolver(customerSchema),
    defaultValues: isEdit
      ? { code: selectedCustomer?.code ?? '', name: selectedCustomer?.name ?? '', companyId: selectedCustomer?.companyId ?? '', phone: selectedCustomer?.phone ?? '', email: selectedCustomer?.email ?? '', address: selectedCustomer?.address ?? '', taxId: selectedCustomer?.taxId ?? '' }
      : { code: '', name: '', companyId: '', phone: '', email: '', address: '', taxId: '' },
  })

  // Reset form when dialog opens with new customer data
  useEffect(() => {
    if (open === 'edit' && selectedCustomer) {
      form.reset({
        code: selectedCustomer.code ?? '',
        name: selectedCustomer.name ?? '',
        companyId: selectedCustomer.companyId ?? '',
        phone: selectedCustomer.phone ?? '',
        email: selectedCustomer.email ?? '',
        address: selectedCustomer.address ?? '',
        taxId: selectedCustomer.taxId ?? '',
      })
    } else if (open === 'add') {
      form.reset({ code: '', name: '', companyId: '', phone: '', email: '', address: '', taxId: '' })
    }
  }, [open, selectedCustomer])

  const mutation = useMutation({
    mutationFn: (values: CustomerSchema) =>
      isEdit && selectedCustomer ? updateCustomer(selectedCustomer.id, values) : createCustomer(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setOpen(null)
      toast.success(isEdit ? 'Cập nhật khách hàng thành công!' : 'Thêm khách hàng thành công!')
    },
  })

  return (
    <Dialog open={open === 'add' || open === 'edit'} onOpenChange={() => setOpen(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa khách hàng' : 'Thêm mới khách hàng'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Cập nhật thông tin khách hàng.' : 'Nhập thông tin để tạo khách hàng mới.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className='flex flex-1 flex-col gap-4'>
          <div className='flex-1 space-y-4 overflow-y-auto'>
            <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-2'>
              <Label>Mã KH</Label>
              <Input {...form.register('code')} />
              {form.formState.errors.code && <p className='text-sm text-destructive'>{form.formState.errors.code.message}</p>}
            </div>
            <div className='space-y-2'>
              <Label>Tên nhà hàng</Label>
              <Input {...form.register('name')} />
              {form.formState.errors.name && <p className='text-sm text-destructive'>{form.formState.errors.name.message}</p>}
            </div>
          </div>
          <div className='space-y-2'>
            <Label>Công ty</Label>
            <Select onValueChange={(v) => form.setValue('companyId', v)} value={form.watch('companyId') ?? ''}>
              <SelectTrigger><SelectValue placeholder='Chọn công ty...' /></SelectTrigger>
              <SelectContent>
                {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {form.formState.errors.companyId && <p className='text-sm text-destructive'>{form.formState.errors.companyId.message}</p>}
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-2'>
              <Label>Điện thoại</Label>
              <Input {...form.register('phone')} />
            </div>
            <div className='space-y-2'>
              <Label>Email</Label>
              <Input {...form.register('email')} />
              {form.formState.errors.email && <p className='text-sm text-destructive'>{form.formState.errors.email.message}</p>}
            </div>
          </div>
          <div className='space-y-2'>
            <Label>Địa chỉ</Label>
            <Input {...form.register('address')} />
          </div>
          <div className='space-y-2'>
            <Label>MST</Label>
            <Input {...form.register('taxId')} />
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
