import { useNavigate, useRouter } from '@tanstack/react-router'
import { ArrowLeft, LogIn03 } from '@untitledui/icons'
import { Button } from '@/components/base/buttons/button'
import { ErrorPage } from './error-page'

export function UnauthorisedError() {
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <ErrorPage
      code='401'
      title='Yêu cầu đăng nhập'
      description={
        <>
          Phiên đăng nhập của bạn đã hết hạn hoặc bạn chưa đăng nhập hệ thống. <br />
          Vui lòng đăng nhập để tiếp tục.
        </>
      }
      actions={
        <>
          <Button color='secondary' iconLeading={ArrowLeft} onClick={() => history.go(-1)}>
            Quay lại
          </Button>
          <Button iconLeading={LogIn03} onClick={() => navigate({ to: '/sign-in' })}>
            Đăng nhập ngay
          </Button>
        </>
      }
    />
  )
}
