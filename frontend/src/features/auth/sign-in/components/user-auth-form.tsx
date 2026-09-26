import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { signInWithEmail } from '@/services/auth'
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

export function UserAuthForm({
  className,
  redirectTo,
}: UserAuthFormProps) {
  const { auth } = useAuthStore()
  const navigate = useNavigate()

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

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
