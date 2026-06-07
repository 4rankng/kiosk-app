import { useSearch } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthLayout>
      <Card className='w-full max-w-sm gap-4'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl tracking-tight'>Đăng nhập</CardTitle>
          <CardDescription>
            Đăng nhập bằng tài khoản đã được phê duyệt để truy cập hệ thống.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserAuthForm redirectTo={redirect} />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
