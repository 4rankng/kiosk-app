import type { MobileCardConfig } from '@/components/data-table/mobile-card-types'

export const companiesCardConfig: MobileCardConfig = {
  name: { role: 'title' },
  taxId: { role: 'detail', label: 'Mã số thuế' },
  priceListId: { role: 'metric', label: 'Bảng giá' },
  actions: { role: 'detail', hidden: true },
}
