import { Outlet } from '@tanstack/react-router'
import { LayoutProvider, useLayout } from '@/context/layout-provider'
import { cn } from '@/lib/utils'
import { AppSidebar, MobileSidebar } from './app-sidebar'
import { SidebarUIProvider, useSidebarUI } from './use-sidebar-ui'
import { SkipToMain } from '@/components/skip-to-main'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

type SidebarVariant = ReturnType<typeof useLayout>['variant']
type SidebarCollapsible = ReturnType<typeof useLayout>['collapsible']

function getContentPad(variant: SidebarVariant, collapsible: SidebarCollapsible, rail: boolean) {
  if (collapsible === 'offcanvas') return undefined
  if (variant === 'floating') return rail ? 'lg:pl-[calc(4rem+8px)]' : 'lg:pl-[calc(15rem+8px)]'
  return rail ? 'lg:pl-16' : 'lg:pl-60'
}

function Shell({
  children,
}: {
  children?: React.ReactNode
}) {
  const { variant, collapsible } = useLayout()
  const { collapsed } = useSidebarUI()
  const rail = collapsible === 'icon' && collapsed

  const contentPad = getContentPad(variant, collapsible, rail)

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
