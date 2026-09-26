import { useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LogIn } from 'lucide-react'

export function UnauthorisedError() {
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <div className='h-svh bg-background'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2 px-4'>
        <h1 className='text-[6rem] leading-tight font-bold text-primary/80 font-heading'>401</h1>
        <span className='text-lg font-medium'>Yêu cầu đăng nhập</span>
        <p className='text-center text-sm text-muted-foreground max-w-md'>
          Phiên đăng nhập của bạn đã hết hạn hoặc bạn chưa đăng nhập hệ thống. <br />
          Vui lòng đăng nhập để tiếp tục.
        </p>
        <div className='mt-6 flex gap-3'>
          <Button variant='outline' className='h-9' onClick={() => history.go(-1)}>
            <ArrowLeft className='mr-1.5 h-4 w-4' />
            Quay lại
          </Button>
          <Button className='h-9' onClick={() => navigate({ to: '/sign-in' })}>
            <LogIn className='mr-1.5 h-4 w-4' />
            Đăng nhập ngay
          </Button>
        </div>
      </div>
    </div>
  )
}
