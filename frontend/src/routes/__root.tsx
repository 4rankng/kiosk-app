import { type QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { NavigationProgress } from '@/components/navigation-progress'
import { GeneralError } from '@/features/errors/general-error'
import { NotFoundError } from '@/features/errors/not-found-error'
import { SearchProvider } from '@/context/search-provider'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => {
    return (
      <>
        <NavigationProgress />
        <SearchProvider>
          <Outlet />
        </SearchProvider>
        <Toaster
          duration={5000}
          toastOptions={{
            classNames: {
              toast: 'rounded-lg border border-primary bg-primary text-fg-primary shadow-lg',
              description: 'text-tertiary',
              actionButton: 'rounded-md bg-brand-solid text-white',
              cancelButton: 'rounded-md bg-secondary text-secondary',
            },
          }}
        />
      </>
    )
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})
