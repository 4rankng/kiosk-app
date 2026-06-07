import type { MobileCardConfig } from '@/components/data-table/mobile-card-types'

export const productsCardConfig: MobileCardConfig = {
  code: { role: 'detail', hidden: true },
  name: { role: 'title' },
  category: { role: 'detail', hidden: true },
  unit: { role: 'detail', hidden: true },
  defaultSalePrice: { role: 'metric' },
  purchasePrice: { role: 'detail', hidden: true },
  actions: { role: 'detail', hidden: true },
}
