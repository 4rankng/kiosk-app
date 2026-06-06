import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotificationBell() {
  return (
    <Button variant='ghost' size='icon' className='relative rounded-full'>
      <Bell className='size-5' />
      <span className='sr-only'>Notifications</span>
      {/* Notification badge - can be enabled later */}
      {/* <span className='absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500' /> */}
    </Button>
  )
}
