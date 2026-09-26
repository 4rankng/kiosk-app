import { useNavigate, useRouter } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home, RefreshCw } from 'lucide-react'

type GeneralErrorProps = React.HTMLAttributes<HTMLDivElement> & {
  minimal?: boolean
}

export function GeneralError({
  className,
  minimal = false,
}: GeneralErrorProps) {
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <div className={cn('h-svh w-full bg-background', className)}>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2 px-4'>
        {!minimal && (
          <h1 className='text-[6rem] leading-tight font-bold font-heading text-destructive/80'>500</h1>
        )}
        <span className='text-lg font-medium'>Đã xảy ra lỗi hệ thống</span>
        <p className='text-center text-sm text-muted-foreground max-w-md'>
          Hệ thống gặp sự cố trong quá trình xử lý yêu cầu. <br />
          Chúng tôi rất xin lỗi vì sự bất tiện này. Vui lòng thử lại sau.
        </p>
        {!minimal && (
          <div className='mt-6 flex gap-3'>
            <Button variant='outline' className='h-9' onClick={() => window.location.reload()}>
              <RefreshCw className='mr-1.5 h-4 w-4' />
              Tải lại trang
            </Button>
            <Button variant='outline' className='h-9' onClick={() => history.go(-1)}>
              <ArrowLeft className='mr-1.5 h-4 w-4' />
              Quay lại
            </Button>
            <Button className='h-9' onClick={() => navigate({ to: '/' })}>
              <Home className='mr-1.5 h-4 w-4' />
              Về trang chủ
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
