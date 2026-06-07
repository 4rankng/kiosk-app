import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { signInWithEmail, signInWithGoogle } from '@/services/auth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ.'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu.'),
})

type LoginForm = z.infer<typeof loginSchema>

interface UserAuthFormProps {
  className?: string
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
}: UserAuthFormProps) {
  const [googleLoading, setGoogleLoading] = useState(false)
  const { auth } = useAuthStore()
  const navigate = useNavigate()

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  function handleGoogleSignIn() {
    setGoogleLoading(true)
    toast.promise(signInWithGoogle(), {
      loading: 'Đang đăng nhập...',
      success: (user) => {
        setGoogleLoading(false)
        auth.setUser(user)
        auth.setAccessToken('mock-access-token')
        navigate({ to: redirectTo || '/', replace: true })
        return 'Đăng nhập thành công!'
      },
      error: (err: Error) => {
        setGoogleLoading(false)
        return err.message || 'Có lỗi xảy ra, vui lòng thử lại.'
      },
    })
  }

  function handleEmailSignIn(values: LoginForm) {
    toast.promise(signInWithEmail(values.email, values.password), {
      loading: 'Đang đăng nhập...',
      success: (user) => {
        auth.setUser(user)
        auth.setAccessToken('mock-access-token')
        navigate({ to: redirectTo || '/', replace: true })
        return 'Đăng nhập thành công!'
      },
      error: (err: Error) => {
        return err.message || 'Có lỗi xảy ra, vui lòng thử lại.'
      },
    })
  }

  return (
    <div className={cn('grid gap-4', className)}>
      <Button
        variant='outline'
        disabled={googleLoading}
        onClick={handleGoogleSignIn}
        type='button'
        className='w-full h-11'
      >
        {googleLoading ? (
          <Loader2 className='animate-spin' />
        ) : (
          <svg className='mr-2 h-4 w-4' viewBox='0 0 24 24'>
            <path
              d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z'
              fill='#4285F4'
            />
            <path
              d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
              fill='#34A853'
            />
            <path
              d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
              fill='#FBBC05'
            />
            <path
              d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
              fill='#EA4335'
            />
          </svg>
        )}
        Đăng nhập bằng Google
      </Button>

      <div className='relative'>
        <Separator />
        <span className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground'>
          hoặc
        </span>
      </div>

      <form onSubmit={form.handleSubmit(handleEmailSignIn)} className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            type='email'
            placeholder='admin@phuonglinh.vn'
            className='h-11'
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className='text-sm text-destructive'>
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
        <div className='space-y-2'>
          <Label htmlFor='password'>Mật khẩu</Label>
          <Input
            id='password'
            type='password'
            placeholder='••••••••'
            className='h-11'
            {...form.register('password')}
          />
          {form.formState.errors.password && (
            <p className='text-sm text-destructive'>
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
        <Button type='submit' className='w-full h-11' disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <Loader2 className='animate-spin' />
          ) : (
            'Đăng nhập'
          )}
        </Button>
      </form>

      <p className='text-center text-xs text-muted-foreground'>
        Chỉ tài khoản được phê duyệt mới có thể truy cập hệ thống.
      </p>
    </div>
  )
}
