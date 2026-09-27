import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { NotificationBell } from '@/components/notification-bell'
import { TodayStats } from './components/today-stats'
import { MonthlyRevenueChart } from './components/monthly-revenue-chart'
import { TopCustomers } from './components/top-customers'
import { TopProducts } from './components/top-products'
import { OutstandingDebts } from './components/outstanding-debts'
import { RecentInvoices } from './components/recent-invoices'
import { WidgetCard } from './components/widget-card'

export function Dashboard() {
  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <NotificationBell />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageHeader title='Tổng quan' description='Tình hình kinh doanh hôm nay.' />

        <div className='space-y-4'>
          <TodayStats />

          <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
            <WidgetCard
              title='Doanh thu theo tháng'
              description='So sánh doanh thu các tuần trong tháng'
              className='lg:col-span-4'
              contentClassName='ps-2 pt-0'
            >
              <MonthlyRevenueChart />
            </WidgetCard>
            <div className='lg:col-span-3'>
              <TopCustomers />
            </div>
          </div>

          <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
            <div className='lg:col-span-4'>
              <TopProducts />
            </div>
            <div className='lg:col-span-3'>
              <OutstandingDebts />
            </div>
          </div>

          <RecentInvoices />
        </div>
      </Main>
    </>
  )
}
