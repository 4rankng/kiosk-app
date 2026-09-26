import type { Customer } from '@/types'
import { Pencil01, Trash01 } from '@untitledui/icons'
import { Button } from '@/components/base/buttons/button'
import { useCustomersContext } from './customers-provider'

export function CustomerActionsCell({ customer }: { customer: Customer }) {
  const { setOpen, setSelectedCustomer } = useCustomersContext()
  return (
    <div className='flex items-center gap-1'>
      <Button
        color='tertiary'
        size='xs'
        iconLeading={Pencil01}
        aria-label='Chỉnh sửa khách hàng'
        onPress={() => {
          setSelectedCustomer(customer)
          setOpen('edit')
        }}
      />
      <Button
        color='tertiary-destructive'
        size='xs'
        iconLeading={Trash01}
        aria-label='Xóa khách hàng'
        onPress={() => {
          setSelectedCustomer(customer)
          setOpen('delete')
        }}
      />
    </div>
  )
}
