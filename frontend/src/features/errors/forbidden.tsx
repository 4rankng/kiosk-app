import { useNavigate, useRouter } from '@tanstack/react-router'
import { ArrowLeft, Home01 } from '@untitledui/icons'
import { Button } from '@/components/base/buttons/button'
import { ErrorPage } from './error-page'

export function ForbiddenError() {
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <ErrorPage
      code='403'
      title='Không có quyền truy cập'
      description={
        <>
          Tài khoản của bạn không được phân quyền xem nội dung này. <br />
          Vui lòng liên hệ quản trị viên để được cấp quyền.
        </>
      }
      actions={
        <>
          <Button color='secondary' iconLeading={ArrowLeft} onClick={() => history.go(-1)}>
            Quay lại
          </Button>
          <Button iconLeading={Home01} onClick={() => navigate({ to: '/' })}>
            Về trang chủ
          </Button>
        </>
      }
    />
  )
}
