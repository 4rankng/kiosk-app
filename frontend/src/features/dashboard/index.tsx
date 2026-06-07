import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { NotificationBell } from '@/components/notification-bell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TodayStats } from './components/today-stats'
import { MonthlyRevenueChart } from './components/monthly-revenue-chart'
import { TopCustomers } from './components/top-customers'
import { TopProducts } from './components/top-products'
import { OutstandingDebts } from './components/outstanding-debts'
import { RecentInvoices } from './components/recent-invoices'

export function Dashboard() {
  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <NotificationBell />
        <ProfileDropdown />
      </Header>
      <Main>
        <div className='mb-4 flex items-end justify-between gap-4'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-bold tracking-tight'>Tổng quan</h1>
            <p className='text-sm text-muted-foreground'>Tình hình kinh doanh hôm nay.</p>
          </div>
        </div>

        <div className='space-y-4'>
          <TodayStats />

          <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
            <Card className='lg:col-span-4'>
              <CardHeader className='pb-2'>
                <CardTitle>Doanh thu theo tháng</CardTitle>
                <CardDescription>So sánh doanh thu các tuần trong tháng</CardDescription>
              </CardHeader>
              <CardContent className='ps-2 pt-0'>
                <MonthlyRevenueChart />
              </CardContent>
            </Card>
            <Card className='lg:col-span-3'>
              <TopCustomers />
            </Card>
          </div>

          <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
            <Card className='lg:col-span-4'>
              <TopProducts />
            </Card>
            <Card className='lg:col-span-3'>
              <OutstandingDebts />
            </Card>
          </div>

          <Card>
            <RecentInvoices />
          </Card>
        </div>
      </Main>
    </>
  )
}
