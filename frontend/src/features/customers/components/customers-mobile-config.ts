import type { MobileCardConfig } from '@/components/data-table/mobile-card-types'

export const customersCardConfig: MobileCardConfig = {
  code: { role: 'detail', label: 'Mã KH' },
  name: { role: 'title' },
  companyId: { role: 'metric', label: 'Công ty' },
  contact: { role: 'detail', label: 'Liên hệ' },
  actions: { role: 'detail', hidden: true },
}
