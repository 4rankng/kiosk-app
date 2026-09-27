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
import { toast } from 'sonner'
import { ProductFormFields } from './product-form-fields'

/** Default (empty or selected-product) values for the product form. */
function getProductFormDefaults(
  isEdit: boolean,
  selectedProduct: {
    code?: string
    name?: string
    categoryName?: string | null
    unitName?: string | null
    description?: string | null
    purchasePrice?: number
    defaultSalePrice: number
  } | null
): ProductSchema {
  if (isEdit && selectedProduct) {
    return {
      code: selectedProduct.code ?? '',
      name: selectedProduct.name ?? '',
      category: selectedProduct.categoryName ?? '',
      unit: selectedProduct.unitName ?? '',
      description: selectedProduct.description ?? '',
      purchasePrice: selectedProduct.purchasePrice ?? 0,
      defaultSalePrice: selectedProduct.defaultSalePrice ?? 0,
    }
  }
  return {
    code: '',
    name: '',
    category: '',
    unit: '',
    description: '',
    purchasePrice: 0,
    defaultSalePrice: 0,
  }
}

/** Map form values onto the API payload, resolving category/unit names to IDs. */
function buildProductPayload(
  values: ProductSchema,
  categories: Array<{ id: string; name: string }>,
  units: Array<{ id: string; name: string }>
) {
  return {
    code: values.code,
    name: values.name,
    description: values.description,
    categoryId: categories.find((c) => c.name === values.category)?.id ?? null,
    unitId: units.find((u) => u.name === values.unit)?.id ?? null,
    purchasePrice: values.purchasePrice,
    defaultSalePrice: values.defaultSalePrice,
  }
}

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
    defaultValues: getProductFormDefaults(isEdit, selectedProduct),
  })

  // Reset form when dialog opens with new product data
  useEffect(() => {
    if (open === 'edit' || open === 'add') {
      form.reset(getProductFormDefaults(isEdit, selectedProduct))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedProduct])

  const mutation = useMutation({
    mutationFn: (values: ProductSchema) => {
      const payload = buildProductPayload(values, categories, units)
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
    <ProductFormFields
      form={form}
      categoryOptions={categoryOptions}
      unitOptions={unitOptions}
      onCreateCategory={handleCreateCategory}
      onCreateUnit={handleCreateUnit}
    />
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
