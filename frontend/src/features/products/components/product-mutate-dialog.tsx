import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProduct, updateProduct } from '@/services/products'
import { getCategories, createCategory } from '@/services/categories'
import { getUnits, createUnit } from '@/services/units'
import { productSchema, type ProductSchema } from '../data/schema'
import { useProductsContext } from './products-provider'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InlineAddCombobox } from '@/components/inline-add-combobox'
import { NumberInput } from '@/components/number-input'
import { toast } from 'sonner'

export function ProductMutateDialog() {
  const { open, setOpen, selectedProduct } = useProductsContext()
  const queryClient = useQueryClient()
  const isEdit = open === 'edit'

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const { data: units = [] } = useQuery({ queryKey: ['units'], queryFn: getUnits })

  const categoryOptions = categories.map((c) => ({ value: c.name, label: c.name }))
  const unitOptions = units.map((u) => ({ value: u.name, label: u.name }))

  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: isEdit
      ? { code: selectedProduct?.code ?? '', name: selectedProduct?.name ?? '', category: selectedProduct?.category ?? '', unit: selectedProduct?.unit ?? '', description: selectedProduct?.description ?? '', purchasePrice: selectedProduct?.purchasePrice ?? 0, defaultSalePrice: selectedProduct?.defaultSalePrice ?? 0 }
      : { code: '', name: '', category: '', unit: '', description: '', purchasePrice: 0, defaultSalePrice: 0 },
  })

  // Reset form when dialog opens with new product data
  useEffect(() => {
    if (open === 'edit' && selectedProduct) {
      form.reset({
        code: selectedProduct.code ?? '',
        name: selectedProduct.name ?? '',
        category: selectedProduct.category ?? '',
        unit: selectedProduct.unit ?? '',
        description: selectedProduct.description ?? '',
        purchasePrice: selectedProduct.purchasePrice ?? 0,
        defaultSalePrice: selectedProduct.defaultSalePrice ?? 0,
      })
    } else if (open === 'add') {
      form.reset({ code: '', name: '', category: '', unit: '', description: '', purchasePrice: 0, defaultSalePrice: 0 })
    }
  }, [open, selectedProduct])

  const mutation = useMutation({
    mutationFn: (values: ProductSchema) =>
      isEdit && selectedProduct ? updateProduct(selectedProduct.id, values) : createProduct(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['price-lists'] })
      setOpen(null)
      toast.success(isEdit ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!')
    },
  })

  async function handleCreateCategory(name: string): Promise<string> {
    const cat = await createCategory(name)
    queryClient.invalidateQueries({ queryKey: ['categories'] })
    return cat.name
  }

  async function handleCreateUnit(name: string): Promise<string> {
    const u = await createUnit(name)
    queryClient.invalidateQueries({ queryKey: ['units'] })
    return u.name
  }

  return (
    <Dialog open={open === 'add' || open === 'edit'} onOpenChange={() => setOpen(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Cập nhật thông tin sản phẩm.' : 'Nhập thông tin để tạo sản phẩm mới.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className='flex flex-1 flex-col gap-4'>
          <div className='flex-1 space-y-4 overflow-y-auto'>
            <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-2'>
              <Label htmlFor='code'>Mã hàng</Label>
              <Input id='code' {...form.register('code')} />
              {form.formState.errors.code && <p className='text-sm text-destructive'>{form.formState.errors.code.message}</p>}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='name'>Tên sản phẩm</Label>
              <Input id='name' {...form.register('name')} />
              {form.formState.errors.name && <p className='text-sm text-destructive'>{form.formState.errors.name.message}</p>}
            </div>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-2'>
              <Label>Nhóm hàng</Label>
              <InlineAddCombobox
                options={categoryOptions}
                value={form.watch('category')}
                onChange={(val) => form.setValue('category', val, { shouldValidate: true })}
                onCreate={handleCreateCategory}
                placeholder='Chọn nhóm...'
              />
              {form.formState.errors.category && <p className='text-sm text-destructive'>{form.formState.errors.category.message}</p>}
            </div>
            <div className='space-y-2'>
              <Label>Đơn vị</Label>
              <InlineAddCombobox
                options={unitOptions}
                value={form.watch('unit')}
                onChange={(val) => form.setValue('unit', val, { shouldValidate: true })}
                onCreate={handleCreateUnit}
                placeholder='Chọn ĐVT...'
              />
              {form.formState.errors.unit && <p className='text-sm text-destructive'>{form.formState.errors.unit.message}</p>}
            </div>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='description'>Mô tả</Label>
            <textarea id='description' {...form.register('description')} className='flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm' placeholder='Mô tả sản phẩm...' />
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-2'>
              <Label htmlFor='purchasePrice'>Giá nhập</Label>
              <NumberInput
                id='purchasePrice'
                value={form.watch('purchasePrice') ?? 0}
                onValueChange={(v) => form.setValue('purchasePrice', v, { shouldValidate: true })}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='defaultSalePrice'>Giá bán</Label>
              <NumberInput
                id='defaultSalePrice'
                value={form.watch('defaultSalePrice') ?? 0}
                onValueChange={(v) => form.setValue('defaultSalePrice', v, { shouldValidate: true })}
              />
            </div>
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
