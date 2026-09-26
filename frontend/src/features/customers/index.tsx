import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { NotificationBell } from '@/components/notification-bell'
import { Button } from '@/components/base/buttons/button'
import { Plus } from '@untitledui/icons'
import { Breadcrumbs } from '@/components/application/breadcrumbs/breadcrumbs'
import { CustomersDialogs } from './components/customers-dialogs'
import { CustomersProvider, useCustomersContext } from './components/customers-provider'
import { CustomersTable } from './components/customers-table'

function AddCustomerButton() {
  const { setOpen } = useCustomersContext()
  return (
    <Button onPress={() => setOpen('add')} iconLeading={Plus}>
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
        <div className='flex flex-col gap-1'>
          <Breadcrumbs>
            <Breadcrumbs.Item>Khách hàng</Breadcrumbs.Item>
            <Breadcrumbs.Item>Danh sách KH</Breadcrumbs.Item>
          </Breadcrumbs>
          <PageHeader
            title='Danh sách đối tác bán buôn'
            description='Quản lý khách hàng và thông tin liên hệ.'
            actions={<AddCustomerButton />}
          />
        </div>
        <CustomersTable />
      </Main>
      <CustomersDialogs />
    </CustomersProvider>
  )
}
