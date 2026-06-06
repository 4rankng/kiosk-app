import { z } from 'zod'

export const customerSchema = z.object({
  code: z.string().min(1, 'Vui lòng nhập mã khách hàng'),
  name: z.string().min(1, 'Vui lòng nhập tên nhà hàng'),
  companyId: z.string().min(1, 'Vui lòng chọn công ty'),
  phone: z.string().min(1, 'Vui lòng nhập số điện thoại'),
  email: z.string().email('Email không hợp lệ'),
  address: z.string().min(1, 'Vui lòng nhập địa chỉ'),
  taxId: z.string().optional().default(''),
})

export type CustomerSchema = z.infer<typeof customerSchema>
