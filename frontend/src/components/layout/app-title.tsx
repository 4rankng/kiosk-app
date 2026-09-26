import { Link } from '@tanstack/react-router'
import { useLayout } from '@/context/layout-provider'
import { useSidebarUI } from './use-sidebar-ui'

type AppTitleProps = {
  /** Render the expanded logo row even when the desktop rail is collapsed (mobile drawer). */
  forceExpanded?: boolean
}

export function AppTitle({ forceExpanded = false }: AppTitleProps) {
  const { collapsible } = useLayout()
  const { collapsed, setOpen } = useSidebarUI()
  const iconOnly = collapsible === 'icon' && collapsed && !forceExpanded

  return (
    <Link
      to='/'
      onClick={() => setOpen(false)}
      className='flex h-12 shrink-0 items-center gap-2 rounded-md px-2 outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover focus-visible:outline-2 focus-visible:-outline-offset-2'
    >
      <img src='/favicon.png' alt='TingTing Kiosk' className='size-8 shrink-0 rounded-md' />
      {!iconOnly && <span className='truncate text-sm font-bold text-secondary'>TingTing Kiosk</span>}
    </Link>
  )
}
