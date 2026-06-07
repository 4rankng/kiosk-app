import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function NotificationBell() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='relative rounded-full'>
          <Bell className='size-5' />
          <span className='sr-only'>Thông báo</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-80 p-0'>
        <div className='flex items-center justify-between border-b px-4 py-3'>
          <h4 className='text-sm font-semibold'>Thông báo</h4>
        </div>
        <div className='flex flex-col items-center justify-center gap-2 p-8 text-center'>
          <Bell className='size-8 text-muted-foreground/40' />
          <p className='text-sm text-muted-foreground'>Không có thông báo mới</p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
