import { useEffect, useState } from 'react'
import { Menu01 } from '@untitledui/icons'
import { ButtonUtility } from '@/components/base/buttons/button-utility'
import { useLayout } from '@/context/layout-provider'
import { useSidebarUI } from './use-sidebar-ui'
import { cn } from '@/lib/utils'

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export function Header({ className, fixed, children, ...props }: HeaderProps) {
  const { collapsible } = useLayout()
  const { collapsed, setCollapsed, setOpen } = useSidebarUI()
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }
    document.addEventListener('scroll', onScroll, { passive: true })
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  const handleToggle = () => {
    if (collapsible === 'icon') {
      setCollapsed(!collapsed)
    } else {
      setOpen(true)
    }
  }

  return (
    <header
      className={cn(
        'z-40 h-12',
        fixed && 'header-fixed peer/header sticky top-0 w-[inherit]',
        offset > 10 && fixed ? 'shadow-xs' : 'shadow-none',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative flex h-full items-center gap-2 p-3',
          offset > 10 &&
            fixed &&
            'after:absolute after:inset-0 after:-z-10 after:bg-primary/80 after:backdrop-blur-sm'
        )}
      >
        <ButtonUtility
          icon={Menu01}
          tooltip='Mở menu điều hướng'
          color='tertiary'
          className='lg:hidden'
          onClick={() => setOpen(true)}
        />
        {collapsible !== 'none' && (
          <ButtonUtility
            icon={Menu01}
            tooltip='Mở menu điều hướng'
            color='tertiary'
            className='hidden lg:inline-flex'
            onClick={handleToggle}
          />
        )}
        <div className='h-6 w-px bg-border-secondary' aria-hidden='true' />
        {children}
      </div>
    </header>
  )
}
