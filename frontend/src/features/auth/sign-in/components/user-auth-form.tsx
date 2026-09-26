import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { signInWithEmail, signInWithGoogle } from '@/services/auth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/base/buttons/button'
import { InputBase, TextField } from '@/components/base/input/input'
import { Label } from '@/components/base/input/label'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ.'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu.'),
})

type LoginForm = z.infer<typeof loginSchema>

interface UserAuthFormProps {
  className?: string
  redirectTo?: string
}

function GoogleIcon() {
  return (
    <svg aria-hidden='true' className='h-4 w-4' viewBox='0 0 24 24'>
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
  )
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
      success: (res) => {
        setGoogleLoading(false)
        auth.setUser(res.user)
        auth.setAccessToken(res.accessToken)
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
    toast.promise(signInWithEmail({ email: values.email, password: values.password }), {
      loading: 'Đang đăng nhập...',
      success: (res) => {
        auth.setUser(res.user)
        auth.setAccessToken(res.accessToken)
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
        color='secondary'
        isLoading={googleLoading}
        onClick={handleGoogleSignIn}
        type='button'
        iconLeading={<GoogleIcon />}
        className='w-full'
      >
        Đăng nhập bằng Google
      </Button>

      <div className='relative'>
        <div aria-hidden='true' className='absolute inset-0 flex items-center'>
          <div className='w-full border-t border-primary' />
        </div>
        <div className='relative flex justify-center'>
          <span className='bg-primary px-2 text-xs text-tertiary'>hoặc</span>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(handleEmailSignIn)} className='space-y-3'>
        <div className='space-y-1.5'>
          <TextField>
            <Label>Email</Label>
            <InputBase
              type='email'
              placeholder='admin@tingting.vn'
              isInvalid={!!form.formState.errors.email}
              {...form.register('email')}
            />
          </TextField>
          {form.formState.errors.email && (
            <p className='text-xs text-error-primary'>
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
        <div className='space-y-1.5'>
          <TextField>
            <Label>Mật khẩu</Label>
            <InputBase
              type='password'
              placeholder='••••••••'
              isInvalid={!!form.formState.errors.password}
              {...form.register('password')}
            />
          </TextField>
          {form.formState.errors.password && (
            <p className='text-xs text-error-primary'>
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
        <Button
          type='submit'
          className='w-full'
          isLoading={form.formState.isSubmitting}
        >
          Đăng nhập
        </Button>
      </form>

      <p className='text-center text-xs text-tertiary'>
        Chỉ tài khoản được phê duyệt mới có thể truy cập hệ thống.
      </p>
    </div>
  )
}
