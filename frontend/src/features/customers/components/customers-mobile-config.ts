import type { MobileCardConfig } from '@/components/data-table/mobile-card-types'

export const customersCardConfig: MobileCardConfig = {
  code: { role: 'detail', hidden: true },
  name: { role: 'title' },
  companyId: { role: 'metric', label: 'Công ty' },
  phone: { role: 'detail', label: 'Điện thoại' },
  email: { role: 'detail', hidden: true },
  address: { role: 'detail', hidden: true },
  taxId: { role: 'detail', hidden: true },
  actions: { role: 'detail', hidden: true },
}
