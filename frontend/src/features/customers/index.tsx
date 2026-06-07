import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { NotificationBell } from '@/components/notification-bell'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CustomersDialogs } from './components/customers-dialogs'
import { CustomersProvider, useCustomersContext } from './components/customers-provider'
import { CustomersTable } from './components/customers-table'

function AddCustomerButton() {
  const { setOpen } = useCustomersContext()
  return (
    <Button onClick={() => setOpen('add')}>
      <Plus className='mr-2 h-4 w-4' />
      Thêm
    </Button>
  )
}

export function Customers() {
  return (
    <CustomersProvider>
      <Header fixed>
        <Search className='me-auto' />
        <NotificationBell />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Danh sách đối tác bán buôn</h2>
            <p className='text-muted-foreground'>Quản lý khách hàng và thông tin liên hệ.</p>
          </div>
          <AddCustomerButton />
        </div>
        <CustomersTable />
      </Main>
      <CustomersDialogs />
    </CustomersProvider>
  )
}
