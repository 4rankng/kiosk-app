import type { MobileCardConfig } from '@/components/data-table/mobile-card-types'

export const productsCardConfig: MobileCardConfig = {
  code: { role: 'detail' },
  name: { role: 'title' },
  category: { role: 'detail' },
  unit: { role: 'detail' },
  defaultSalePrice: { role: 'metric', label: 'Giá bán' },
  purchasePrice: { role: 'detail', label: 'Giá nhập' },
  actions: { role: 'detail', hidden: true },
}
