import {
  BarChart01,
  Building02,
  File03,
  Home03,
  List,
  Package,
  ShoppingCart01,
  Tag01,
  Users02,
  UsersCheck,
  FileSearch02,
} from '@untitledui/icons'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Quản trị viên',
    email: 'admin@phuonglinh.vn',
    avatar: '',
  },
  teams: [],
  navGroups: [
    {
      title: '',
      items: [
        { title: 'Tổng quan', url: '/', icon: Home03 },
        {
          title: 'Hàng hóa',
          icon: Package,
          items: [
            { title: 'Sản phẩm', url: '/products', icon: List },
            { title: 'Bảng giá', url: '/price-lists', icon: Tag01 },
          ],
        },
        {
          title: 'Khách hàng',
          icon: Users02,
          items: [
            { title: 'Nhóm KH', url: '/companies', icon: Building02 },
            { title: 'Danh sách KH', url: '/customers', icon: List },
          ],
        },
        { title: 'Bán hàng', url: '/orders/new', icon: ShoppingCart01 },
        { title: 'Hóa đơn', url: '/invoices', icon: File03 },
        {
          title: 'Báo cáo',
          icon: BarChart01,
          items: [
            { title: 'Hàng hóa', url: '/reports/products', icon: FileSearch02 },
            { title: 'Khách hàng', url: '/reports/customers', icon: UsersCheck },
          ],
        },
      ],
    },
  ],
}
