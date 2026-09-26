import { Outlet } from '@tanstack/react-router'
import { LayoutProvider, useLayout } from '@/context/layout-provider'
import { cn } from '@/lib/utils'
import { AppSidebar, MobileSidebar } from './app-sidebar'
import { SidebarUIProvider, useSidebarUI } from './use-sidebar-ui'
import { SkipToMain } from '@/components/skip-to-main'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

function Shell({
  children,
}: {
  children?: React.ReactNode
}) {
  const { variant, collapsible } = useLayout()
  const { collapsed } = useSidebarUI()
  const rail = collapsible === 'icon' && collapsed

  const contentPad =
    collapsible === 'offcanvas'
      ? undefined
      : variant === 'floating'
        ? rail
          ? 'lg:pl-[calc(4rem+8px)]'
          : 'lg:pl-[calc(15rem+8px)]'
        : rail
          ? 'lg:pl-16'
          : 'lg:pl-60'

  return (
    <>
      <SkipToMain />
      {collapsible !== 'offcanvas' && <AppSidebar />}
      <MobileSidebar />
      <main
        id='content'
        className={cn(
          '@container/content has-data-[layout=fixed]:h-svh min-h-svh transition-[padding] duration-200 ease-linear',
          contentPad,
          variant === 'inset' && 'bg-secondary'
        )}
      >
        {variant === 'inset' ? (
          <div className='min-h-svh p-2 lg:p-3'>
            <div className='rounded-xl border border-primary bg-primary min-h-svh lg:min-h-[calc(100svh-1.5rem)]'>
              {children ?? <Outlet />}
            </div>
          </div>
        ) : (
          children ?? <Outlet />
        )}
      </main>
    </>
  )
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <LayoutProvider>
      <SidebarUIProvider>
        <Shell>
          {children}
        </Shell>
      </SidebarUIProvider>
    </LayoutProvider>
  )
}
