import type { MobileCardConfig } from '@/components/data-table/mobile-card-types'

export const productsCardConfig: MobileCardConfig = {
  name: { role: 'title' },
  defaultSalePrice: { role: 'metric' },
  actions: { role: 'detail', hidden: true },
}
