import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { InvoicesDialogs } from './components/invoices-dialogs'
import { InvoicesProvider } from './components/invoices-provider'
import { InvoicesTable } from './components/invoices-table'

export function Invoices() {
  return (
    <InvoicesProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Lịch sử giao dịch</h2>
            <p className='text-muted-foreground'>
              Quản lý hóa đơn và in ấn.
            </p>
          </div>
        </div>
        <InvoicesTable />
      </Main>
      <InvoicesDialogs />
    </InvoicesProvider>
  )
}
