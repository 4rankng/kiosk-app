import { useNavigate, useRouter } from '@tanstack/react-router'
import { ArrowLeft, Home01 } from '@untitledui/icons'
import { Button } from '@/components/base/buttons/button'
import { ErrorPage } from './error-page'

export function NotFoundError() {
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <ErrorPage
      code='404'
      title='Không tìm thấy trang'
      description={
        <>
          Đường dẫn bạn yêu cầu không tồn tại hoặc đã được thay đổi. <br />
          Vui lòng kiểm tra lại địa chỉ hoặc quay về trang chủ.
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
