import type { MobileCardConfig } from '@/components/data-table/mobile-card-types'

export const customersCardConfig: MobileCardConfig = {
  code: { role: 'detail', label: 'Mã KH' },
  name: { role: 'title' },
  companyId: { role: 'metric', label: 'Công ty' },
  phone: { role: 'detail', label: 'Điện thoại' },
  email: { role: 'detail', label: 'Email' },
  address: { role: 'detail', label: 'Địa chỉ' },
  taxId: { role: 'detail', label: 'MST' },
  actions: { role: 'detail', hidden: true },
}
