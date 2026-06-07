import {
  LayoutDashboard,
  Package,
  List,
  DollarSign,
  Users,
  ShoppingCart,
  FileText,
  BarChart3,
  PackageSearch,
  UserCheck,
  Building2,
} from 'lucide-react'
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
        {
          title: 'Tổng quan',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Hàng hóa',
          icon: Package,
          items: [
            {
              title: 'Sản phẩm',
              url: '/products',
              icon: List,
            },
            {
              title: 'Bảng giá',
              url: '/price-lists',
              icon: DollarSign,
            },
          ],
        },
        {
          title: 'Khách hàng',
          icon: Users,
          items: [
            {
              title: 'Danh sách KH',
              url: '/customers',
              icon: List,
            },
            {
              title: 'Nhóm KH',
              url: '/companies',
              icon: Building2,
            },
          ],
        },
        {
          title: 'Bán hàng',
          url: '/orders/new',
          icon: ShoppingCart,
        },
        {
          title: 'Hóa đơn',
          url: '/invoices',
          icon: FileText,
        },
        {
          title: 'Báo cáo',
          icon: BarChart3,
          items: [
            {
              title: 'Hàng hóa',
              url: '/reports/products',
              icon: PackageSearch,
            },
            {
              title: 'Khách hàng',
              url: '/reports/customers',
              icon: UserCheck,
            },
          ],
        },
      ],
    },
  ],
}
