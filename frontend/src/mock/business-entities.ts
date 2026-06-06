import type { BusinessEntity } from '@/types/business-entity'

export const businessEntities: BusinessEntity[] = [
  {
    id: 'be-1',
    name: 'Hộ kinh doanh Phương Linh',
    address: 'Số 12, Ngõ 45, Đường Minh Khai, Quận Hai Bà Trưng, Hà Nội',
    taxId: '0123456789',
    phone: '024-1234-5678',
    headerLines: [
      'HỘ KINH DOANH PHƯƠNG LINH',
      'Địa chỉ: Số 12, Ngõ 45, Đường Minh Khai, Q.Hai Bà Trưng, Hà Nội',
      'Điện thoại: 024-1234-5678 | MST: 0123456789',
    ],
  },
  {
    id: 'be-2',
    name: 'Hộ kinh doanh Hồng Hạnh',
    address: 'Số 88, Đường Lĩnh Nam, Quận Hoàng Mai, Hà Nội',
    taxId: '0987654321',
    phone: '024-9876-5432',
    headerLines: [
      'HỘ KINH DOANH HỒNG HẠNH',
      'Địa chỉ: Số 88, Đường Lĩnh Nam, Q.Hoàng Mai, Hà Nội',
      'Điện thoại: 024-9876-5432 | MST: 0987654321',
    ],
  },
]
