import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TodayStats } from './components/today-stats'
import { MonthlyRevenueChart } from './components/monthly-revenue-chart'
import { TopCustomers } from './components/top-customers'

export function Dashboard() {
  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-6'>
        <TodayStats />
        <MonthlyRevenueChart />
        <TopCustomers />
      </Main>
    </>
  )
}
