export interface Customer {
  id: string
  code: string
  name: string
  companyId: string
  companyName: string | null
  priceListId: string | null
  phone: string | null
  email: string | null
  address: string | null
  taxId: string | null
  isActive: string
}
