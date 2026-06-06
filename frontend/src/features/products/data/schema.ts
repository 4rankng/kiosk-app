import { z } from 'zod'

export const productSchema = z.object({
  code: z.string().min(1, 'Vui lòng nhập mã hàng'),
  name: z.string().min(1, 'Vui lòng nhập tên sản phẩm'),
  category: z.string().min(1, 'Vui lòng nhập nhóm hàng'),
  unit: z.string().min(1, 'Vui lòng nhập đơn vị tính'),
  description: z.string().optional().default(''),
  purchasePrice: z.coerce.number().min(0, 'Giá nhập phải lớn hơn hoặc bằng 0'),
  defaultSalePrice: z.coerce.number().min(0, 'Giá bán phải lớn hơn hoặc bằng 0'),
  stock: z.coerce.number().default(0),
})

export type ProductSchema = z.infer<typeof productSchema>
