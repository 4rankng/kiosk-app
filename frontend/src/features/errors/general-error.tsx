import { useNavigate, useRouter } from '@tanstack/react-router'
import { ArrowLeft, Home01, RefreshCw01 } from '@untitledui/icons'
import { Button } from '@/components/base/buttons/button'
import { ErrorPage } from './error-page'

type GeneralErrorProps = React.HTMLAttributes<HTMLDivElement> & {
  minimal?: boolean
}

export function GeneralError({ className, minimal = false }: GeneralErrorProps) {
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <ErrorPage
      className={className}
      code={minimal ? undefined : '500'}
      title='Đã xảy ra lỗi hệ thống'
      description={
        <>
          Hệ thống gặp sự cố trong quá trình xử lý yêu cầu. <br />
          Chúng tôi rất xin lỗi vì sự bất tiện này. Vui lòng thử lại sau.
        </>
      }
      actions={
        minimal ? undefined : (
          <>
            <Button color='secondary' iconLeading={RefreshCw01} onClick={() => window.location.reload()}>
              Tải lại trang
            </Button>
            <Button color='secondary' iconLeading={ArrowLeft} onClick={() => history.go(-1)}>
              Quay lại
            </Button>
            <Button iconLeading={Home01} onClick={() => navigate({ to: '/' })}>
              Về trang chủ
            </Button>
          </>
        )
      }
    />
  )
}
