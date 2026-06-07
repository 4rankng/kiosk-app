import type { MobileCardConfig } from '@/components/data-table/mobile-card-types'

export const companiesCardConfig: MobileCardConfig = {
  name: { role: 'title' },
  taxId: { role: 'detail', label: 'MST' },
  priceListId: { role: 'detail', label: 'Bảng giá' },
  actions: { role: 'detail', hidden: true },
}
