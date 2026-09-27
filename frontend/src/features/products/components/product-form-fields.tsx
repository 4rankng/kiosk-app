import { type UseFormReturn } from 'react-hook-form'
import { InputBase } from '@/components/base/input/input'
import { Label } from '@/components/base/input/label'
import { TextAreaBase } from '@/components/base/textarea/textarea'
import { InlineAddCombobox } from '@/components/inline-add-combobox'
import { NumberInput } from '@/components/number-input'
import type { ProductSchema } from '../data/schema'

interface CategoryUnitOption {
  value: string
  label: string
}

export interface ProductFormFieldsProps {
  form: UseFormReturn<ProductSchema>
  categoryOptions: CategoryUnitOption[]
  unitOptions: CategoryUnitOption[]
  onCreateCategory: (name: string) => Promise<string>
  onCreateUnit: (name: string) => Promise<string>
}

/**
 * Body of the product create/edit dialog: identity fields (code, name),
 * category/unit comboboxes, description, and the two price inputs.
 */
export function ProductFormFields({
  form,
  categoryOptions,
  unitOptions,
  onCreateCategory,
  onCreateUnit,
}: ProductFormFieldsProps) {
  return (
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
            onCreate={onCreateCategory}
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
            onCreate={onCreateUnit}
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
}
