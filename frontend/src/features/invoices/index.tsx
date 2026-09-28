import { InvoicesDialogs } from './components/invoices-dialogs'
import { InvoicesProvider } from './components/invoices-provider'
import { InvoicesTable } from './components/invoices-table'
import { EntityScreen } from '@/components/entity-screen'

export function Invoices() {
  return (
    <InvoicesProvider>
      <EntityScreen
        title='Lịch sử giao dịch'
        description='Quản lý hóa đơn và in ấn.'
        dialogs={<InvoicesDialogs />}
      >
        <InvoicesTable />
      </EntityScreen>
    </InvoicesProvider>
  )
}
