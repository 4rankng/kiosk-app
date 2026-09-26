import { useEffect, useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { createCompany, updateCompany } from '@/services/companies'
import { getPriceLists } from '@/services/price-lists'
import { companySchema, type CompanySchema } from '../data/schema'
import { useCompaniesContext } from './companies-provider'
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal'
import { Button } from '@/components/base/buttons/button'
import { InputBase, TextField } from '@/components/base/input/input'
import { Label } from '@/components/base/input/label'
import { Select } from '@/components/base/select/select'
import { SelectItem } from '@/components/base/select/select-item'
import { toast } from 'sonner'

export function CompanyMutateDialog() {
  const { open, setOpen, selectedCompany } = useCompaniesContext()
  const queryClient = useQueryClient()
  const isEdit = open === 'edit'
  const titleId = useId()
  const { data: priceLists = [] } = useQuery({ queryKey: ['price-lists'], queryFn: () => getPriceLists() })

  const form = useForm<CompanySchema>({
    resolver: zodResolver(companySchema),
    defaultValues: isEdit
      ? { name: selectedCompany?.name ?? '', taxCode: selectedCompany?.taxCode ?? '', priceListId: selectedCompany?.priceListId ?? '' }
      : { name: '', taxCode: '', priceListId: '' },
  })

  // Reset form when dialog opens with new company data
  useEffect(() => {
    if (open === 'edit' && selectedCompany) {
      form.reset({
        name: selectedCompany.name ?? '',
        taxCode: selectedCompany.taxCode ?? '',
        priceListId: selectedCompany.priceListId ?? '',
      })
    } else if (open === 'add') {
      form.reset({ name: '', taxCode: '', priceListId: '' })
    }
  }, [open, selectedCompany])

  const mutation = useMutation({
    mutationFn: (values: CompanySchema) =>
      isEdit && selectedCompany ? updateCompany(selectedCompany.id, values) : createCompany({ ...values, address: null, email: null, phone: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      setOpen(null)
      toast.success(isEdit ? 'Cập nhật công ty thành công!' : 'Thêm công ty thành công!')
    },
  })

  return (
    <ModalOverlay isOpen={open === 'add' || open === 'edit'} onOpenChange={() => setOpen(null)}>
      <Modal className='w-full max-w-lg'>
        <Dialog aria-labelledby={titleId}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v as CompanySchema))} className='flex flex-col gap-5 p-5 sm:p-6'>
            <div className='flex flex-col gap-1 text-start'>
              <h2 id={titleId} className='text-md font-semibold text-primary'>
                {isEdit ? 'Chỉnh sửa công ty' : 'Thêm công ty/chuỗi mới'}
              </h2>
              <p className='text-sm text-tertiary'>
                {isEdit ? 'Cập nhật thông tin công ty.' : 'Nhập thông tin để tạo công ty mới.'}
              </p>
            </div>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <TextField>
                    <Label>Tên công ty</Label>
                    <InputBase {...form.register('name')} isInvalid={!!form.formState.errors.name} />
                  </TextField>
                  {form.formState.errors.name && <p className='text-xs text-error-primary'>{form.formState.errors.name.message}</p>}
                </div>
                <div className='space-y-1.5'>
                  <TextField>
                    <Label>MST</Label>
                    <InputBase {...form.register('taxCode')} />
                  </TextField>
                </div>
              </div>
              <div className='space-y-1.5'>
                <Select
                  label='Bảng giá'
                  placeholder='Chọn bảng giá...'
                  selectedKey={form.watch('priceListId') || null}
                  onSelectionChange={(key) => form.setValue('priceListId', String(key), { shouldValidate: true })}
                  items={priceLists.map((pl) => ({ id: pl.id, label: pl.name }))}
                >
                  {(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}
                </Select>
                {form.formState.errors.priceListId && <p className='text-xs text-error-primary'>{form.formState.errors.priceListId.message}</p>}
              </div>
            </div>
            <div className='flex flex-col-reverse gap-x-2 gap-y-2 border-t border-secondary pt-4 sm:flex-row sm:justify-end'>
              <Button color='secondary' type='button' onPress={() => setOpen(null)}>
                Hủy bỏ
              </Button>
              <Button
                type='submit'
                isLoading={mutation.isPending}
                showTextWhileLoading
              >
                {mutation.isPending ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </div>
          </form>
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
