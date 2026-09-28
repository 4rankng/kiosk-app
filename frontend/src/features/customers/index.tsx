import { Button } from '@/components/base/buttons/button'
import { Plus } from '@untitledui/icons'
import { EntityScreen } from '@/components/entity-screen'
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
      <EntityScreen
        crumbs={['Khách hàng', 'Danh sách KH']}
        title='Danh sách đối tác bán buôn'
        description='Quản lý khách hàng và thông tin liên hệ.'
        actions={<AddCustomerButton />}
        dialogs={<CustomersDialogs />}
      >
        <CustomersTable />
      </EntityScreen>
    </CustomersProvider>
  )
}
