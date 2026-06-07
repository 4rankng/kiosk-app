import { Logo } from '@/assets/logo'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='flex h-svh flex-col items-center justify-center gap-6 p-6'>
      <div className='flex items-center justify-center gap-2'>
        <Logo className='h-6 w-6' />
        <h1 className='text-xl font-semibold tracking-tight'>TingTing Kiosk</h1>
      </div>
      {children}
    </div>
  )
}
