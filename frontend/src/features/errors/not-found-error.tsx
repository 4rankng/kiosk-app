import { useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home } from 'lucide-react'

export function NotFoundError() {
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <div className='h-svh bg-background'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2 px-4'>
        <h1 className='text-[6rem] leading-tight font-bold text-primary/80 font-heading'>404</h1>
        <span className='text-lg font-medium'>Không tìm thấy trang</span>
        <p className='text-center text-sm text-muted-foreground max-w-md'>
          Đường dẫn bạn yêu cầu không tồn tại hoặc đã được thay đổi. <br />
          Vui lòng kiểm tra lại địa chỉ hoặc quay về trang chủ.
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
