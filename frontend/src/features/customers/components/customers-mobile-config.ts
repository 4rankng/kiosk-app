import type { MobileCardConfig } from '@/components/data-table/mobile-card-types'

export const customersCardConfig: MobileCardConfig = {
  code: { role: 'detail' },
  name: { role: 'title' },
  companyId: { role: 'detail', label: 'Công ty' },
  contact: { role: 'metric', label: 'Liên hệ' },
  actions: { role: 'detail', hidden: true },
}
