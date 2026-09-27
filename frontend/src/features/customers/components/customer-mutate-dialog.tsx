import { useEffect, useId } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { createCustomer, updateCustomer } from '@/services/customers'
import { getCompanies } from '@/services/companies'
import type { Company } from '@/types/company'
import { customerSchema, type CustomerSchema } from '../data/schema'
import { useCustomersContext } from './customers-provider'
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal'
import { InputBase, TextField } from '@/components/base/input/input'
import { Label } from '@/components/base/input/label'
import { Select } from '@/components/base/select/select'
import { SelectItem } from '@/components/base/select/select-item'
import { MutateDialogFooter, MutateDialogHeader } from '@/features/companies/components/mutate-dialog-parts'
import { toast } from 'sonner'

function CustomerFormFields({
  form,
  companies,
}: {
  form: UseFormReturn<CustomerSchema>
  companies: Company[]
}) {
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1.5'>
          <TextField>
            <Label>Mã KH</Label>
            <InputBase {...form.register('code')} isInvalid={!!form.formState.errors.code} />
          </TextField>
          {form.formState.errors.code && <p className='text-xs text-error-primary'>{form.formState.errors.code.message}</p>}
        </div>
        <div className='space-y-1.5'>
          <TextField>
            <Label>Tên nhà hàng</Label>
            <InputBase {...form.register('name')} isInvalid={!!form.formState.errors.name} />
          </TextField>
          {form.formState.errors.name && <p className='text-xs text-error-primary'>{form.formState.errors.name.message}</p>}
        </div>
      </div>
      <div className='space-y-1.5'>
        <Select
          label='Công ty'
          placeholder='Chọn công ty...'
          selectedKey={form.watch('companyId') || null}
          onSelectionChange={(key) => form.setValue('companyId', String(key), { shouldValidate: true })}
          isInvalid={!!form.formState.errors.companyId}
          items={companies.map((c) => ({ id: c.id, label: c.name }))}
        >
          {(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}
        </Select>
        {form.formState.errors.companyId && <p className='text-xs text-error-primary'>{form.formState.errors.companyId.message}</p>}
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1.5'>
          <TextField>
            <Label>Điện thoại</Label>
            <InputBase {...form.register('phone')} />
          </TextField>
        </div>
        <div className='space-y-1.5'>
          <TextField>
            <Label>Email</Label>
            <InputBase {...form.register('email')} isInvalid={!!form.formState.errors.email} />
          </TextField>
          {form.formState.errors.email && <p className='text-xs text-error-primary'>{form.formState.errors.email.message}</p>}
        </div>
      </div>
      <div className='space-y-1.5'>
        <TextField>
          <Label>Địa chỉ</Label>
          <InputBase {...form.register('address')} />
        </TextField>
      </div>
      <div className='space-y-1.5'>
        <TextField>
          <Label>MST</Label>
          <InputBase {...form.register('taxId')} />
        </TextField>
      </div>
    </div>
  )
}

export function CustomerMutateDialog() {
  const { open, setOpen, selectedCustomer } = useCustomersContext()
  const queryClient = useQueryClient()
  const isEdit = open === 'edit'
  const titleId = useId()
  const { data: companiesData } = useQuery({ queryKey: ['companies'], queryFn: () => getCompanies() })
  const companies = companiesData?.data ?? []

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
    <ModalOverlay isOpen={open === 'add' || open === 'edit'} onOpenChange={() => setOpen(null)}>
      <Modal className='w-full max-w-lg'>
        <Dialog aria-labelledby={titleId}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className='flex flex-col gap-5 p-5 sm:p-6'>
            <MutateDialogHeader
              titleId={titleId}
              title={isEdit ? 'Chỉnh sửa khách hàng' : 'Thêm mới khách hàng'}
              description={isEdit ? 'Cập nhật thông tin khách hàng.' : 'Nhập thông tin để tạo khách hàng mới.'}
            />
            <CustomerFormFields form={form} companies={companies} />
            <MutateDialogFooter
              onCancel={() => setOpen(null)}
              isPending={mutation.isPending}
              isEdit={isEdit}
            />
          </form>
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
