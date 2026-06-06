import type { Customer } from '@/types'
import { useCustomersContext } from './customers-provider'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'

export function CustomerActionsCell({ customer }: { customer: Customer }) {
  const { setOpen, setSelectedCustomer } = useCustomersContext()
  return (
    <div className='flex items-center gap-1'>
      <Button variant='ghost' size='icon' onClick={() => { setSelectedCustomer(customer); setOpen('edit') }}>
        <Pencil className='h-4 w-4' />
      </Button>
      <Button variant='ghost' size='icon' onClick={() => { setSelectedCustomer(customer); setOpen('delete') }}>
        <Trash2 className='h-4 w-4 text-destructive' />
      </Button>
    </div>
  )
}
