import { Logo } from '@/assets/logo'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='grid min-h-svh bg-primary lg:grid-cols-2'>
      <div className='relative hidden overflow-hidden bg-brand-solid lg:block'>
        <div
          aria-hidden='true'
          className='absolute inset-0 bg-linear-to-b from-white/10 via-transparent to-black/25'
        />
        <div className='relative flex h-full flex-col justify-between p-10 text-white'>
          <div className='flex items-center gap-2.5'>
            <Logo className='h-7 w-7' />
            <span className='font-heading text-display-lg font-semibold tracking-tight'>
              TingTing Kiosk
            </span>
          </div>
          <div className='max-w-md space-y-2'>
            <p className='font-heading text-display-lg font-semibold'>
              Bán hàng nhanh gọn ngay tại quầy.
            </p>
            <p className='text-md text-white/80'>
              Đăng nhập để quản lý sản phẩm, đơn hàng và theo dõi doanh thu của cửa hàng bạn.
            </p>
          </div>
        </div>
      </div>

      <div className='flex flex-col items-center justify-center px-6 py-10'>
        <div className='mb-8 flex items-center gap-2 text-primary lg:hidden'>
          <Logo className='h-6 w-6' />
          <span className='font-heading text-display-lg font-semibold tracking-tight'>
            TingTing Kiosk
          </span>
        </div>
        <main className='w-full max-w-sm'>{children}</main>
      </div>
    </div>
  )
}
