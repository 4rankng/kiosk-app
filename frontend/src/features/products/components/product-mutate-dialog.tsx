import { useEffect, useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProduct, updateProduct } from '@/services/products'
import { getCategories, createCategory } from '@/services/categories'
import { getUnits, createUnit } from '@/services/units'
import { productSchema, type ProductSchema } from '../data/schema'
import { useProductsContext } from './products-provider'
import { Dialog, Modal, ModalOverlay } from '@/components/application/modals/modal'
import { Button } from '@/components/base/buttons/button'
import { InputBase } from '@/components/base/input/input'
import { Label } from '@/components/base/input/label'
import { TextAreaBase } from '@/components/base/textarea/textarea'
import { InlineAddCombobox } from '@/components/inline-add-combobox'
import { NumberInput } from '@/components/number-input'
import { toast } from 'sonner'

export function ProductMutateDialog() {
  const { open, setOpen, selectedProduct } = useProductsContext()
  const queryClient = useQueryClient()
  const titleId = useId()
  const isEdit = open === 'edit'
  const isOpen = open === 'add' || open === 'edit'

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const { data: units = [] } = useQuery({ queryKey: ['units'], queryFn: getUnits })

  const categoryOptions = categories.map((c) => ({ value: c.name, label: c.name }))
  const unitOptions = units.map((u) => ({ value: u.name, label: u.name }))

  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: isEdit
      ? { code: selectedProduct?.code ?? '', name: selectedProduct?.name ?? '', category: selectedProduct?.categoryName ?? '', unit: selectedProduct?.unitName ?? '', description: selectedProduct?.description ?? '', purchasePrice: selectedProduct?.purchasePrice ?? 0, defaultSalePrice: selectedProduct?.defaultSalePrice ?? 0 }
      : { code: '', name: '', category: '', unit: '', description: '', purchasePrice: 0, defaultSalePrice: 0 },
  })

  // Reset form when dialog opens with new product data
  useEffect(() => {
    if (open === 'edit' && selectedProduct) {
      form.reset({
        code: selectedProduct.code ?? '',
        name: selectedProduct.name ?? '',
        category: selectedProduct.categoryName ?? '',
        unit: selectedProduct.unitName ?? '',
        description: selectedProduct.description ?? '',
        purchasePrice: selectedProduct.purchasePrice ?? 0,
        defaultSalePrice: selectedProduct.defaultSalePrice ?? 0,
      })
    } else if (open === 'add') {
      form.reset({ code: '', name: '', category: '', unit: '', description: '', purchasePrice: 0, defaultSalePrice: 0 })
    }
  }, [open, selectedProduct])

  const mutation = useMutation({
    mutationFn: (values: ProductSchema) => {
      // Resolve category/unit names to IDs
      const categoryId = categories.find((c) => c.name === values.category)?.id ?? null
      const unitId = units.find((u) => u.name === values.unit)?.id ?? null
      const payload = {
        code: values.code,
        name: values.name,
        description: values.description,
        categoryId,
        unitId,
        purchasePrice: values.purchasePrice,
        defaultSalePrice: values.defaultSalePrice,
      }
      return isEdit && selectedProduct
        ? updateProduct(selectedProduct.id, payload)
        : createProduct(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['price-lists'] })
      setOpen(null)
      toast.success(isEdit ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!')
    },
  })

  async function handleCreateCategory(name: string): Promise<string> {
    const cat = await createCategory({ name })
    queryClient.invalidateQueries({ queryKey: ['categories'] })
    return cat.id
  }

  async function handleCreateUnit(name: string): Promise<string> {
    const u = await createUnit({ name })
    queryClient.invalidateQueries({ queryKey: ['units'] })
    return u.id
  }

  const title = isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'
  const description = isEdit ? 'Cập nhật thông tin sản phẩm.' : 'Nhập thông tin để tạo sản phẩm mới.'
  const submitLabel = isEdit ? 'Cập nhật' : 'Tạo mới'

  const formFields = (
    <>
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='code'>Mã hàng</Label>
          <InputBase id='code' {...form.register('code')} isInvalid={!!form.formState.errors.code} />
          {form.formState.errors.code && (
            <p className='text-xs text-error-primary'>{form.formState.errors.code.message}</p>
          )}
        </div>
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='name'>Tên sản phẩm</Label>
          <InputBase id='name' {...form.register('name')} isInvalid={!!form.formState.errors.name} />
          {form.formState.errors.name && (
            <p className='text-xs text-error-primary'>{form.formState.errors.name.message}</p>
          )}
        </div>
      </div>
      <div className='grid grid-cols-1 gap-3'>
        <div className='flex flex-col gap-1.5'>
          <Label>Nhóm hàng</Label>
          <InlineAddCombobox
            options={categoryOptions}
            value={form.watch('category')}
            onChange={(val) => form.setValue('category', val, { shouldValidate: true })}
            onCreate={handleCreateCategory}
            placeholder='Chọn nhóm...'
          />
          {form.formState.errors.category && (
            <p className='text-xs text-error-primary'>{form.formState.errors.category.message}</p>
          )}
        </div>
        <div className='flex flex-col gap-1.5'>
          <Label>Đơn vị</Label>
          <InlineAddCombobox
            options={unitOptions}
            value={form.watch('unit')}
            onChange={(val) => form.setValue('unit', val, { shouldValidate: true })}
            onCreate={handleCreateUnit}
            placeholder='Chọn ĐVT...'
          />
          {form.formState.errors.unit && (
            <p className='text-xs text-error-primary'>{form.formState.errors.unit.message}</p>
          )}
        </div>
      </div>
      <div className='flex flex-col gap-1.5'>
        <Label htmlFor='description'>Mô tả</Label>
        <TextAreaBase id='description' {...form.register('description')} placeholder='Mô tả sản phẩm...' />
      </div>
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='purchasePrice'>Giá nhập</Label>
          <NumberInput id='purchasePrice' value={form.watch('purchasePrice') ?? 0} onValueChange={(v) => form.setValue('purchasePrice', v, { shouldValidate: true })} />
        </div>
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='defaultSalePrice'>Giá bán</Label>
          <NumberInput id='defaultSalePrice' value={form.watch('defaultSalePrice') ?? 0} onValueChange={(v) => form.setValue('defaultSalePrice', v, { shouldValidate: true })} />
        </div>
      </div>
    </>
  )

  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={(o) => { if (!o) setOpen(null) }}>
      <Modal className='w-full max-w-lg'>
        <Dialog aria-labelledby={titleId}>
          <div className='flex max-h-[inherit] flex-col'>
            <div className='flex flex-col gap-1 border-b border-secondary px-5 py-4'>
              <h2 id={titleId} className='text-md font-semibold text-primary'>{title}</h2>
              <p className='text-sm text-tertiary'>{description}</p>
            </div>
            <form id='product-form' onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className='flex flex-col gap-4 overflow-y-auto px-5 py-4'>
              {formFields}
            </form>
            <div className='flex flex-col-reverse gap-2 border-t border-secondary px-5 py-4 sm:flex-row sm:justify-end'>
              <Button color='secondary' onPress={() => setOpen(null)}>Hủy bỏ</Button>
              <Button type='submit' form='product-form' isLoading={mutation.isPending} className='flex-1 sm:flex-initial'>
                {submitLabel}
              </Button>
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
