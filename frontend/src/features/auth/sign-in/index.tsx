import { useNavigate, useSearch } from '@tanstack/react-router'
import { ArrowLeft } from '@untitledui/icons'
import { Button } from '@/components/base/buttons/button'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })
  const navigate = useNavigate()

  return (
    <AuthLayout>
      <div className='space-y-6'>
        <div className='space-y-2 text-center'>
          <h1 className='font-heading text-display-xs font-semibold tracking-tight'>
            Đăng nhập
          </h1>
          <p className='text-sm text-tertiary'>
            Đăng nhập bằng tài khoản đã được phê duyệt để truy cập hệ thống.
          </p>
        </div>
        <UserAuthForm redirectTo={redirect} />
        <div className='flex justify-center'>
          <Button
            color='link-gray'
            iconLeading={ArrowLeft}
            onClick={() => navigate({ to: '/' })}
          >
            Trở về trang chủ
          </Button>
        </div>
      </div>
    </AuthLayout>
  )
}
