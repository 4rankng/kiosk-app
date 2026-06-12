import { z } from 'zod'

export const companySchema = z.object({
  name: z.string().min(1, 'Tên công ty là bắt buộc.'),
  taxCode: z.string(),
  priceListId: z.string(),
})

export type CompanySchema = z.input<typeof companySchema>
