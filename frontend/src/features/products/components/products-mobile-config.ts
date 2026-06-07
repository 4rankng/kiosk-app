import type { MobileCardConfig } from '@/components/data-table/mobile-card-types'

export const productsCardConfig: MobileCardConfig = {
  name: { role: 'title' },
  defaultSalePrice: { role: 'metric' },
  code: { role: 'detail', label: 'Mã hàng' },
  category: { role: 'detail', label: 'Nhóm' },
  unit: { role: 'detail', label: 'ĐVT' },
  purchasePrice: { role: 'detail', label: 'Giá nhập' },
  actions: { role: 'detail', hidden: true },
}
