import { Bell03 } from '@untitledui/icons'
import { Popover } from 'react-aria-components'
import { Dialog, DialogTrigger } from '@/components/application/modals/modal'
import { Button } from '@/components/base/buttons/button'

export function NotificationBell() {
  return (
    <DialogTrigger>
      <Button
        aria-label='Thông báo'
        color='tertiary'
        size='sm'
        iconLeading={Bell03}
        className='relative rounded-full'
      />
      <Popover placement='bottom end' className='overflow-hidden rounded-lg bg-primary shadow-lg ring-1 ring-secondary_alt'>
        <Dialog aria-label='Thông báo' className='w-80'>
          <div className='flex items-center justify-between border-b border-secondary px-4 py-3'>
            <h4 className='text-sm font-semibold text-secondary'>Thông báo</h4>
          </div>
          <div className='flex flex-col items-center justify-center gap-2 p-8 text-center'>
            <Bell03 aria-hidden='true' className='size-8 text-quaternary' />
            <p className='text-sm text-tertiary'>Không có thông báo mới</p>
          </div>
        </Dialog>
      </Popover>
    </DialogTrigger>
  )
}
