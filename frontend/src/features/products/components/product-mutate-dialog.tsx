import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProduct, updateProduct } from '@/services/products'
import { getCategories, createCategory } from '@/services/categories'
import { getUnits, createUnit } from '@/services/units'
import { productSchema, type ProductSchema } from '../data/schema'
import { useProductsContext } from './products-provider'
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InlineAddCombobox } from '@/components/inline-add-combobox'
import { NumberInput } from '@/components/number-input'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile'

export function ProductMutateDialog() {
  const { open, setOpen, selectedProduct } = useProductsContext()
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()
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
    const cat = await createCategory(name)
    queryClient.invalidateQueries({ queryKey: ['categories'] })
    return cat.name
  }

  async function handleCreateUnit(name: string): Promise<string> {
    const u = await createUnit(name)
    queryClient.invalidateQueries({ queryKey: ['units'] })
    return u.name
  }

  const title = isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'
  const description = isEdit ? 'Cập nhật thông tin sản phẩm.' : 'Nhập thông tin để tạo sản phẩm mới.'
  const submitText = mutation.isPending ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'

  const formFields = (
    <>
      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='code'>Mã hàng</Label>
          <Input id='code' {...form.register('code')} />
          {form.formState.errors.code && (
            <p className='text-xs text-destructive'>{form.formState.errors.code.message}</p>
          )}
        </div>
        <div className='space-y-2'>
          <Label htmlFor='name'>Tên sản phẩm</Label>
          <Input id='name' {...form.register('name')} />
          {form.formState.errors.name && (
            <p className='text-xs text-destructive'>{form.formState.errors.name.message}</p>
          )}
        </div>
      </div>
      <div className='grid grid-cols-1 gap-3'>
        <div className='space-y-2'>
          <Label>Nhóm hàng</Label>
          <InlineAddCombobox
            options={categoryOptions}
            value={form.watch('category')}
            onChange={(val) => form.setValue('category', val, { shouldValidate: true })}
            onCreate={handleCreateCategory}
            placeholder='Chọn nhóm...'
          />
          {form.formState.errors.category && (
            <p className='text-xs text-destructive'>{form.formState.errors.category.message}</p>
          )}
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
          {form.formState.errors.unit && (
            <p className='text-xs text-destructive'>{form.formState.errors.unit.message}</p>
          )}
        </div>
      </div>
      <div className='space-y-2'>
        <Label htmlFor='description'>Mô tả</Label>
        <Textarea
          id='description'
          {...form.register('description')}
          placeholder='Mô tả sản phẩm...'
        />
      </div>
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
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
    </>
  )

  // Mobile: bottom Sheet drawer with scrollable content + sticky footer
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={() => setOpen(null)}>
        <SheetContent side='bottom' className='flex flex-col p-0 max-h-[92dvh]'>
          <SheetHeader className='px-4 pt-4 pb-2'>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <form
            id='product-form'
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className='flex-1 overflow-y-auto px-4 py-3 space-y-4'
          >
            {formFields}
          </form>
          <div className='border-t px-4 py-3 flex gap-2'>
            <SheetClose asChild>
              <Button type='button' variant='outline' className='flex-1 min-h-[44px]'>
                Hủy bỏ
              </Button>
            </SheetClose>
            <Button
              type='submit'
              form='product-form'
              className='flex-1 min-h-[44px]'
              disabled={mutation.isPending}
            >
              {submitText}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop: centered Dialog
  return (
    <Dialog open={isOpen} onOpenChange={() => setOpen(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          id='product-form'
          onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
          className='space-y-4'
        >
          {formFields}
        </form>
        <DialogFooter className='border-t pt-4'>
          <DialogClose asChild>
            <Button type='button' variant='outline'>Hủy bỏ</Button>
          </DialogClose>
          <Button
            type='submit'
            form='product-form'
            disabled={mutation.isPending}
          >
            {submitText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
