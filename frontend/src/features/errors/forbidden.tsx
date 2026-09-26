import { useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home, ShieldAlert } from 'lucide-react'

export function ForbiddenError() {
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <div className='h-svh bg-background'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2 px-4'>
        <div className='flex items-center gap-3'>
          <ShieldAlert className='h-12 w-12 text-destructive' />
          <h1 className='text-[5rem] leading-tight font-bold font-heading text-destructive'>403</h1>
        </div>
        <span className='text-lg font-medium'>Không có quyền truy cập</span>
        <p className='text-center text-sm text-muted-foreground max-w-md'>
          Tài khoản của bạn không được phân quyền xem nội dung này. <br />
          Vui lòng liên hệ quản trị viên để được cấp quyền.
        </p>
        <div className='mt-6 flex gap-3'>
          <Button variant='outline' className='h-9' onClick={() => history.go(-1)}>
            <ArrowLeft className='mr-1.5 h-4 w-4' />
            Quay lại
          </Button>
          <Button className='h-9' onClick={() => navigate({ to: '/' })}>
            <Home className='mr-1.5 h-4 w-4' />
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  )
}
