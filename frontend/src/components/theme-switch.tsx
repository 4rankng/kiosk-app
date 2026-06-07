import { Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeSwitch() {
  return (
    <Button variant='ghost' size='icon' className='scale-95 rounded-full'>
      <Sun className='size-[1.2rem] scale-100 rotate-0 transition-all' />
      <span className='sr-only'>Light theme</span>
    </Button>
  )
}
