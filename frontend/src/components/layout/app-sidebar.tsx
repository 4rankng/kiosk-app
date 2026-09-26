import { Dialog, Modal, ModalOverlay } from '@/components/application/modals/modal'
import { ButtonUtility } from '@/components/base/buttons/button-utility'
import { X } from '@untitledui/icons'
import { useLayout } from '@/context/layout-provider'
import { cn } from '@/lib/utils'
import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { useSidebarUI } from './use-sidebar-ui'

/**
 * Desktop static sidebar. Hidden below `lg`; below that breakpoint (and in
 * `offcanvas` mode) the MobileSidebar drawer carries the navigation.
 */
export function AppSidebar() {
  const { variant, collapsible } = useLayout()
  const { collapsed } = useSidebarUI()
  const rail = collapsible === 'icon' && collapsed

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden flex-col bg-primary lg:flex',
        variant === 'floating'
          ? 'my-2 ml-2 rounded-xl ring-1 ring-secondary'
          : 'border-r border-primary',
        rail ? 'w-16' : 'w-60',
        'transition-[width] duration-200 ease-linear'
      )}
    >
      <div className='flex h-full min-h-0 flex-col gap-1 px-2 py-2'>
        <AppTitle />
        <nav aria-label='Điều hướng chính' className='min-h-0 flex-1 overflow-y-auto'>
          {sidebarData.navGroups.map((group) => (
            <NavGroup key={group.title} {...group} />
          ))}
        </nav>
      </div>
    </aside>
  )
}

/**
 * Offcanvas drawer carrying the same navigation. Rendered at any viewport
 * size: below `lg` always, and at desktop size when collapsible is `offcanvas`.
 */
export function MobileSidebar() {
  const { open, setOpen } = useSidebarUI()

  return (
    <ModalOverlay
      isOpen={open}
      onOpenChange={setOpen}
      className='items-stretch justify-start px-0 py-0 [--modal-pb:0px] [--modal-pt:0px] sm:items-stretch sm:justify-start sm:px-0'
    >
      <Modal
        className={(state) =>
          cn(
            'h-dvh max-h-dvh w-60 max-w-[85vw] rounded-r-xl',
            state.isEntering && 'duration-200 ease-out animate-in slide-in-from-left',
            state.isExiting && 'duration-150 ease-in animate-out slide-out-to-left'
          )
        }
      >
        <Dialog aria-label='Menu điều hướng'>
          <div className='flex h-full flex-col bg-primary px-2 py-2'>
            <div className='flex items-center justify-between gap-1'>
              <AppTitle forceExpanded />
              <ButtonUtility
                icon={X}
                tooltip='Đóng menu'
                color='tertiary'
                onClick={() => setOpen(false)}
              />
            </div>
            <nav aria-label='Điều hướng chính' className='min-h-0 flex-1 overflow-y-auto'>
              {sidebarData.navGroups.map((group) => (
                <NavGroup key={group.title} {...group} forceExpanded />
              ))}
            </nav>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
