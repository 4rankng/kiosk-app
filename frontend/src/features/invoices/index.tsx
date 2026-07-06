import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { NotificationBell } from '@/components/notification-bell'
import { InvoicesDialogs } from './components/invoices-dialogs'
import { InvoicesProvider } from './components/invoices-provider'
import { InvoicesTable } from './components/invoices-table'

export function Invoices() {
  return (
    <InvoicesProvider>
      <Header fixed>
        <Search className='me-auto' />
        <NotificationBell />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageHeader title='Lịch sử giao dịch' description='Quản lý hóa đơn và in ấn.' />
        <InvoicesTable />
      </Main>
      <InvoicesDialogs />
    </InvoicesProvider>
  )
}
